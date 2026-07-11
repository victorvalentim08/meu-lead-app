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

        // 🌟 CONFIGURAÇÃO PARA DOCKER (DEFINITIVA E UNIVERSAL)
        // O container já vem com o Google Chrome instalado exatamente nesta pasta do Linux
        const launchOptions = {
            headless: 'new',
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process'
            ]
        };

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1400, height: 900 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

        const leads = [];

        try {
            const urlMaps = `https://www.google.com/maps/search/${encodeURIComponent(termoBusca)}`;
            await page.goto(urlMaps, { waitUntil: 'networkidle2', timeout: 30000 });

            await new Promise(resolve => setTimeout(resolve, 4000));

            const dadosMapeados = await page.evaluate(() => {
                const resultados = [];
                const linksFichas = document.querySelectorAll('a.hfpxzc');
                
                linksFichas.forEach((link) => {
                    const nome = link.getAttribute('aria-label') || '';
                    const urlFicha = link.href || '';
                    const containerPai = link.closest('div.Nv2g1b') || link.parentElement;
                    
                    let enderecoDetectado = '';
                    let telephoneDetectado = '';

                    if (containerPai) {
                        const spans = containerPai.querySelectorAll('span, div');
                        
                        spans.forEach(el => {
                            const texto = el.textContent.trim();
                            if (/\(\d{2}\)\s\d{4,5}-\d{4}/.test(texto)) {
                                telephoneDetectado = texto;
                            }
                            else if (
                                (texto.includes('Rua') || texto.includes('Av.') || texto.includes('R.') || texto.includes('Avenida') || texto.includes('Bairro') || texto.includes('Centro')) &&
                                !texto.includes(nome) && 
                                texto.length > 10 && texto.length < 90
                            ) {
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
                            telefone: telephoneDetectado
                        });
                    }
                });
                
                return resultados;
            });

            const vistos = new Set();
            let idCounter = 1;

            dadosMapeados.forEach((empresa) => {
                if (!vistos.has(empresa.url)) {
                    vistos.add(empresa.url);
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