const puppeteer = require('puppeteer');
const axios = require('axios');

class LeadService {
    async buscarLeads({ tipoEmpresa, cep, cidade, estado }) {
        let localidadeTexto = '';
        let ufTexto = '';

        if (cep) {
            const cepLimpo = cep.replace(/\D/g, '');
            try {
                const cepResponse = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (cepResponse.data && !cepResponse.data.erro) {
                    localidadeTexto = cepResponse.data.localidade;
                    ufTexto = cepResponse.data.uf;
                }
            } catch (e) {
                console.error("Erro ao validar CEP");
            }
        }

        if (!localidadeTexto) {
            localidadeTexto = cidade || 'Fortaleza';
            ufTexto = estado || 'CE';
        }

        const termoBusca = `${tipoEmpresa} em ${localidadeTexto} - ${ufTexto}`;
        console.log(`[🎯 Extração Estruturada] Lendo cartões reais para: ${termoBusca}`);

        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1400, height: 900 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

        const leads = [];

        try {
            const urlMaps = `https://www.google.com/maps/search/${encodeURIComponent(termoBusca)}`;
            await page.goto(urlMaps, { waitUntil: 'networkidle2', timeout: 30000 });

            // Espera 4 segundos para os elementos internos estabilizarem na tela
            await new Promise(resolve => setTimeout(resolve, 4000));

            const dadosMapeados = await page.evaluate(() => {
                const resultados = [];
                const linksFichas = document.querySelectorAll('a.hfpxzc');
                
                linksFichas.forEach((link) => {
                    const nome = link.getAttribute('aria-label') || '';
                    const urlFicha = link.href || '';
                    
                    // Sobe até o container pai que guarda todas as informações escritas daquele card
                    const containerPai = link.closest('div.Nv2g1b') || link.parentElement;
                    
                    let enderecoDetectado = '';
                    let telefoneDetectado = '';

                    if (containerPai) {
                        // Pegamos todos os elementos de texto internos (geralmente spans ou divs menores)
                        const spans = containerPai.querySelectorAll('span, div');
                        
                        spans.forEach(el => {
                            const texto = el.textContent.trim();
                            
                            // 1. Identifica o telefone pelo padrão de número brasileiro
                            if (/\(\d{2}\)\s\d{4,5}-\d{4}/.test(texto)) {
                                telefoneDetectado = texto;
                            }
                            // 2. Identifica o endereço: strings longas que contenham indicações de logradouro ou bairro,
                            // excluindo o próprio nome da empresa para não repetir o erro do print
                            else if (
                                (texto.includes('Rua') || texto.includes('Av.') || texto.includes('R.') || texto.includes('Avenida') || texto.includes('Bairro') || texto.includes('Centro')) &&
                                !texto.includes(nome) && 
                                texto.length > 10 && texto.length < 90
                            ) {
                                // Garante que não é uma frase de status de funcionamento
                                if (!texto.includes('Aberto') && !texto.includes('Fecha') && !texto.includes('Atendimento')) {
                                    enderecoDetectado = texto;
                                }
                            }
                        });
                    }

                    if (nome) {
                        resultados.push({
                            nome: nome,
                            url: urlFicha,
                            endereco: enderecoDetectado,
                            telefone: telefoneDetectado
                        });
                    }
                });
                
                return resultados;
            });

            // Organiza o array eliminando duplicidades de links
            const vistos = new Set();
            let idCounter = 1;

            dadosMapeados.forEach((empresa) => {
                if (!vistos.has(empresa.url)) {
                    vistos.add(empresa.url);
                    
                    // Se o robô não pescou o endereço exato, montamos o padrão da cidade sem misturar os textos
                    const enderecoFinal = empresa.endereco || `Região Central, ${localidadeTexto} - ${ufTexto}`;

                    leads.push({
                        id: idCounter,
                        nome: empresa.nome,
                        endereco: enderecoFinal,
                        site: empresa.url,
                        whatsapp: empresa.telefone || 'Acessar Ficha do Maps',
                        email: 'Não informado'
                    });
                    idCounter++;
                }
            });

        } catch (error) {
            console.error("Erro na filtragem estruturada:", error.message);
        } finally {
            await browser.close();
        }

        if (leads.length === 0) {
            leads.push({
                id: 1,
                nome: `Auditar ${tipoEmpresa}`,
                endereco: `${localidadeTexto} - ${ufTexto}`,
                site: `https://www.google.com/maps/search/${encodeURIComponent(termoBusca)}`,
                whatsapp: "Ver no Maps",
                email: "Ver no Maps"
            });
        }

        return leads;
    }
}

module.exports = new LeadService();