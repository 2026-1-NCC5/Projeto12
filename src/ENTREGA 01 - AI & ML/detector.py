import cv2
from ultralytics import YOLO
from collections import Counter

modelo = YOLO('best.pt')

CLASSES_ALVO = ['pacote de arroz', 'pacote de feijao', 'pacote de spaghetti']

camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("Erro: câmera não encontrada!")
    exit()

print("Câmera iniciada. Pressione 'q' para sair.")

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
    cv2.rectangle(frame_anotado, (10, 10), (380, 130), (0, 0, 0), -1)

    y_pos = 35
    for classe in CLASSES_ALVO:
        quantidade = contagem.get(classe, 0)
        texto = f"{classe}: {quantidade} unidade(s)"
        cor = (0, 255, 0) if quantidade > 0 else (150, 150, 150)
        cv2.putText(frame_anotado, texto, (20, y_pos),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, cor, 2)
        y_pos += 30

    cv2.imshow("Detector de Pacotes", frame_anotado)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camera.release()
cv2.destroyAllWindows()