# Como compilar o aplicativo para .EXE

Para disponibilizar o aplicativo aos alunos como um executável 100% local (sem a necessidade de eles instalarem Python), você pode utilizar o `pyinstaller`.

### Passo a Passo

1. Abra o terminal na sua máquina e instale o pacote de compilação:
   ```bash
   pip install pyinstaller
   ```
   
2. Navegue até o diretório exato deste arquivo:
   ```bash
   cd "src/camera_app"
   ```
   
3. Execute o seguinte comando para compilar. O parâmetro `--add-data` avisa o pacote para incluir o arquivo do modelo inteligente dentro do executável:
   ```bash
   pyinstaller --noconsole --add-data "best.pt;." collection_app.py
   ```
   *(Nota: Se estiver usando MacOS ou Linux, troque `;` por `:`. Exemplo: `"best.pt:."`)*

4. **Pronto!** O aplicativo final estará dentro da nova pasta gerada chamada `dist`. Lá dentro, na pasta `collection_app`, você encontrará o arquivo `collection_app.exe` final que já pode ser distribuído aos alunos!

**Nota sobre a interface:** O `--noconsole` oculta o painel preto de log cmd tradicional do Python rodando como plano de fundo. O aluno verá apenas as janelinhas interativas bonitas (Tkinter e OpenCV).
