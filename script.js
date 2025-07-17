// === COLETANDO INFORMAÇÕES DO HTML (ELEMENTOS EM MEMÓRIA) ===
// Cada linha pega um elemento do HTML pelo seu ID (input, botão, etc.)

const apiKeyInput    = document.getElementById('apiKey');
const gameSelect     = document.getElementById('gameSelect');
const questionInput  = document.getElementById('questionInput');
const askButton      = document.getElementById('askButton');
const aiResponse     = document.getElementById('aiResponse');
const form           = document.getElementById('form');

// === FUNÇÃO PARA CONVERTER MARKDOWN EM HTML ===
const markdownToHTML = (text) => {
    const converter = new showdown.Converter(); // cria objeto conversor
    return converter.makeHtml(text);            // converte markdown em HTML
}

// === FUNÇÃO PRINCIPAL: PERGUNTAR À IA ===
const perguntarAI = async (question, game, apiKey) => {
    const model     = "gemini-2.5-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Prompt com instruções claras sobre o papel da IA e como responder
    const pergunta = `
        ## ESPECIALIDADE
        Você é um especialista assistente de meta para o jogo ${game}

        ## TAREFA
        Responda às perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.

        ## REGRAS
        - Se não souber a resposta, diga 'Não sei'. Não invente.
        - Se a pergunta não for sobre o jogo, diga 'Essa pergunta não está relacionada ao jogo'.
        - Considere a data atual: ${new Date().toLocaleDateString()}
        - Baseie as respostas no patch atual.
        - Só responda sobre o que tiver certeza que existe no jogo atualmente.

        ## RESPOSTA
        - Seja direto. No máximo 500 caracteres.
        - Use markdown.
        - Nada de saudação ou despedida. Vá direto ao ponto.

        ## EXEMPLO DE RESPOSTA
        Pergunta do usuário: Melhor build Rengar jungle  
        Resposta: A build mais atual é:  
        **Itens:** (itens aqui)  
        **Runas:** (runas aqui)  

        ---
        Aqui está a pergunta do usuário: ${question}
    `;

    const contents = [{
        role: "user",
        parts: [{ text: pergunta }]
    }];

    const tools = [{
        google_search: {}
    }];

    // === CHAMADA À API ===
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents, tools })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// === FUNÇÃO QUE PROCESSA O ENVIO DO FORMULÁRIO ===
const enviarFormulario = async (event) => {
    event.preventDefault(); // evita recarregar a página

    const apiKey   = apiKeyInput.value;
    const game     = gameSelect.value;
    const question = questionInput.value;

    // Verifica se todos os campos estão preenchidos
    if (apiKey === '' || game === '' || question === '') {
        alert('Por favor, preencha todos os campos');
        return;
    }

    // Desabilita o botão para evitar múltiplos envios
    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading'); // animação

    try {
        // Faz a pergunta à IA
        const text = await perguntarAI(question, game, apiKey);

        // Exibe a resposta formatada em markdown
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');

    } catch (error) {
        console.log('Erro:', error); // erro na comunicação com a API

    } finally {
        // Restaura o botão ao estado normal
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }
}

// === EVENTO DE ENVIO DO FORMULÁRIO ===
form.addEventListener('submit', enviarFormulario);
