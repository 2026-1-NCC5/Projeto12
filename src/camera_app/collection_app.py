import cv2
import tkinter as tk
from tkinter import ttk, messagebox
from ultralytics import YOLO
from collections import Counter
from supabase import create_client, Client
import os
import sys

# Supabase Authentication
SUPABASE_URL = "https://vrzdckxsjwokgfvdsawp.supabase.co"
SUPABASE_KEY = "sb_publishable_S3xchfNdPkj6H25hYeYHgw_hyqhvFDq"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Model initialization
# We use absolute path considering it might be run from another directory or packaged
if getattr(sys, 'frozen', False):
    application_path = sys._MEIPASS
else:
    application_path = os.path.dirname(os.path.abspath(__file__))
    
model_path = os.path.join(application_path, 'best.pt')

try:
    modelo = YOLO(model_path)
except Exception as e:
    print(f"Aviso: Não foi possível carregar o modelo em {model_path}. Detalhe: {e}")
    modelo = None

CLASSES_ALVO = ['pacote de arroz', 'pacote de feijao', 'pacote de spaghetti']
WEIGHTS = {
    'pacote de arroz': 1.0, 
    'pacote de feijao': 1.0, 
    'pacote de spaghetti': 0.5
}

class CollectionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("MegaVision - Sistema de Coleta")
        self.root.geometry("600x400")
        
        self.teams = []
        self.selected_team_id = None
        self.session_items = []
        
        self.setup_ui()
        self.load_teams()

    def setup_ui(self):
        # Select Team Frame
        self.frame_team = tk.Frame(self.root, pady=40)
        self.frame_team.pack(expand=True)
        
        tk.Label(self.frame_team, text="MegaVision Collection App", font=("Helvetica", 20, "bold"), fg="#00450d").pack(pady=10)
        tk.Label(self.frame_team, text="A ferramenta das equipes para contagem automática.", font=("Helvetica", 10)).pack(pady=5)
        tk.Label(self.frame_team, text="Selecione sua Equipe:", font=("Helvetica", 14)).pack(pady=15)
        
        self.team_combo = ttk.Combobox(self.frame_team, state="readonly", width=50, font=("Helvetica", 12))
        self.team_combo.pack(pady=10)
        
        self.btn_start = tk.Button(self.frame_team, text="Iniciar Janela da Câmera", command=self.start_camera, font=("Helvetica", 12, "bold"), bg="#00450d", fg="white", padx=20, pady=10)
        self.btn_start.pack(pady=20)

    def load_teams(self):
        try:
            response = supabase.table('teams').select('*').order('name').execute()
            self.teams = response.data
            self.team_combo['values'] = [t['name'] for t in self.teams]
            if self.teams:
                self.team_combo.current(0)
        except Exception as e:
            messagebox.showerror("Erro de Rede", f"Não foi possível contactar o banco de dados Supabase.\\nErro: {e}")

    def start_camera(self):
        if not modelo:
            messagebox.showerror("Erro de Modelo", "O arquivo best.pt não foi encontrado. Certifique-se que o modelo treinado está no mesmo diretório do arquivo exe/py.")
            return

        idx = self.team_combo.current()
        if idx == -1:
            messagebox.showwarning("Aviso", "Por favor, selecione uma equipe.")
            return
            
        self.selected_team_id = self.teams[idx]['id']
        team_name = self.teams[idx]['name']
        print(f"Iniciando coleta para: {team_name}")
        
        self.root.withdraw() # hide tkinter window
        self.run_cv_loop(team_name)

    def run_cv_loop(self, team_name):
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            messagebox.showerror("Erro", "Câmera não encontrada!")
            self.show_summary()
            return
            
        cv2.namedWindow(f"MegaVision Camera - {team_name}", cv2.WINDOW_NORMAL)
        
        while True:
            sucesso, frame = camera.read()
            if not sucesso:
                break
                
            resultados = modelo(frame, stream=True, conf=0.5)
            itens_frame = []
            frame_anotado = frame.copy()
            
            for resultado in resultados:
                frame_anotado = resultado.plot()
                classes_ids = resultado.boxes.cls.tolist()
                nomes = resultado.names
                for cls_id in classes_ids:
                    nome_classe = nomes[int(cls_id)]
                    if nome_classe in CLASSES_ALVO:
                        itens_frame.append(nome_classe)
                        
            contagem = Counter(itens_frame)
            
            # Painel esquerdo com contagem
            cv2.rectangle(frame_anotado, (10, 10), (450, 170), (0, 0, 0), -1)
            cv2.putText(frame_anotado, f"Equipe: {team_name}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            y_pos = 70
            for classe in CLASSES_ALVO:
                quantidade = contagem.get(classe, 0)
                texto = f"{classe}: {quantidade} un."
                cor = (0, 255, 0) if quantidade > 0 else (150, 150, 150)
                cv2.putText(frame_anotado, texto, (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, cor, 2)
                y_pos += 30
                
            # Footer instructions
            h, w = frame_anotado.shape[:2]
            cv2.rectangle(frame_anotado, (0, h - 50), (w, h), (0, 69, 13), -1)
            cv2.putText(frame_anotado, "Pressione [S] para SALVAR itens atuais   |   Pressione [Q] para ENCERRAR SESSAO", (40, h - 18), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
            cv2.imshow(f"MegaVision Camera - {team_name}", frame_anotado)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('s'):
                if sum(contagem.values()) > 0:
                    self.save_coleta(contagem, frame_anotado)
                else:
                    print("Nenhum item detectado para salvar.")
            elif key == ord('q'):
                break
                
        camera.release()
        cv2.destroyAllWindows()
        self.show_summary()

    def save_coleta(self, contagem, frame):
        try:
            records = []
            for item, qt in contagem.items():
                if qt > 0:
                    peso = WEIGHTS.get(item, 1.0) * qt
                    records.append({
                        'team_id': self.selected_team_id,
                        'item_type': item,
                        'quantity': qt,
                        'weight_kg': peso
                    })
                    self.session_items.append({'item': item, 'qt': qt})
            
            if records:
                supabase.table('donations').insert(records).execute()
                print("Doação registrada com sucesso!")
                
                # Show visual feedback
                h, w = frame.shape[:2]
                cv2.putText(frame, "SALVO COM SUCESSO!", (w//2 - 150, h//2), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)
                cv2.imshow(f"MegaVision Camera - {self.teams[self.team_combo.current()]['name']}", frame)
                cv2.waitKey(500) # pause slightly to show feedback
                
        except Exception as e:
            print("Erro ao registrar doação:", e)
            messagebox.showerror("Erro de Conexão", f"Não foi possivel salvar no banco de dados.\\nErro: {e}")

    def show_summary(self):
        self.root.deiconify() # show tkinter window again
        
        res = Counter()
        for i in self.session_items:
            res[i['item']] += i['qt']
            
        summary_text = "Nenhum item registrado."
        if res:
            summary_text = "\n".join([f"- {k}: {v} unidades" for k, v in res.items()])
            
        messagebox.showinfo("Resumo da Sessão", f"Sessão Encerrada com Sucesso.\n\nItens totais coletados nesta sessão:\n\n{summary_text}\n\nEles já foram sincronizados com o painel do professor.")
        self.root.quit()

if __name__ == "__main__":
    root = tk.Tk()
    app = CollectionApp(root)
    root.mainloop()
