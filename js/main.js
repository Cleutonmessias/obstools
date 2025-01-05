// Funções utilitárias
function formatarData(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarDataAbreviada(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
}

function diferencaDatas(dataInicial, dataFinal) {
    const data1 = new Date(dataInicial);
    const data2 = typeof dataFinal === 'string' ? new Date(dataFinal) : dataFinal;
    
    const diffTime = Math.abs(data2 - data1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const semanas = Math.floor(diffDays / 7);
    const dias = diffDays % 7;
    
    return { semanas, dias };
}

// Objeto protocolos para gerenciar os protocolos médicos
const protocolos = {
    init: function() {
        // Inicializa os listeners de eventos
        this.initSearch();
        this.initFiltros();
        this.initModal();
    },

    initSearch: function() {
        const searchInput = document.getElementById('protocoloSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const protocoloItems = document.querySelectorAll('.protocolo-item');
                
                protocoloItems.forEach(item => {
                    const titulo = item.querySelector('h4').textContent.toLowerCase();
                    const desc = item.querySelector('.protocolo-desc').textContent.toLowerCase();
                    
                    if (titulo.includes(searchTerm) || desc.includes(searchTerm)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    },

    initFiltros: function() {
        const filtros = document.querySelectorAll('.filtro-btn');
        if (filtros) {
            filtros.forEach(filtro => {
                filtro.addEventListener('click', (e) => {
                    // Remove active de todos os filtros
                    filtros.forEach(f => f.classList.remove('active'));
                    // Adiciona active ao filtro clicado
                    e.target.classList.add('active');
                    
                    const categoria = e.target.dataset.categoria;
                    const grupos = document.querySelectorAll('.protocolo-grupo');
                    
                    grupos.forEach(grupo => {
                        if (categoria === 'todos' || grupo.dataset.categoria === categoria) {
                            grupo.style.display = 'block';
                        } else {
                            grupo.style.display = 'none';
                        }
                    });
                });
            });
        }
    },

    initModal: function() {
        const modal = document.getElementById('protocoloModal');
        const closeBtn = modal.querySelector('.close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    },

    mostrarProtocolo: function(id) {
        const modal = document.getElementById('protocoloModal');
        const conteudo = document.getElementById('protocoloConteudo');
        
        // Aqui você pode carregar o conteúdo do protocolo baseado no ID
        // Por enquanto vamos apenas mostrar um placeholder
        conteudo.innerHTML = `<h2>Protocolo: ${id}</h2><p>Conteúdo do protocolo ${id} será carregado aqui.</p>`;
        
        modal.style.display = 'block';
    }
};

// Objeto geradores com todas as funções
const geradores = {
    calcularPercentil: (input) => {
        const grupo = input.closest('.exame-usg-grupo');
        const peso = parseFloat(input.value);
        const igSemanas = parseInt(grupo.querySelector('.usg-ig-semanas').value);
        const igDias = parseInt(grupo.querySelector('.usg-ig-dias').value) || 0;

        if (!peso || !igSemanas) {
            grupo.querySelector('.usg-percentil').value = '';
            return;
        }

        // Verifica se os elementos da calculadora existem
        const pesoFetalInput = document.getElementById('pesoFetal');
        const igSemanasInput = document.getElementById('igSemanas');
        const igDiasInput = document.getElementById('igDias');
        const calcularBtn = document.querySelector('#calculadoraPercentil button');

        if (!pesoFetalInput || !igSemanasInput || !igDiasInput || !calcularBtn) {
            // Se os elementos não existirem, calcula o percentil usando a lógica antiga
            const igTotal = igSemanas + (igDias / 7);
            
            // Tabela simplificada de percentis
            const percentis = {
                20: { p10: 312, p50: 350, p90: 388 },
                24: { p10: 576, p50: 650, p90: 724 },
                28: { p10: 955, p50: 1100, p90: 1245 },
                32: { p10: 1450, p50: 1700, p90: 1950 },
                36: { p10: 2100, p50: 2500, p90: 2900 },
                40: { p10: 2700, p50: 3200, p90: 3700 }
            };

            const semanas = Object.keys(percentis).map(Number);
            const semanaMaisProxima = semanas.reduce((a, b) => {
                return Math.abs(b - igTotal) < Math.abs(a - igTotal) ? b : a;
            });

            const { p10, p50, p90 } = percentis[semanaMaisProxima];

            let percentil;
            if (peso < p10) percentil = "<10";
            else if (peso > p90) percentil = ">90";
            else if (peso < p50) percentil = "10-50";
            else percentil = "50-90";

            grupo.querySelector('.usg-percentil').value = percentil;
            return;
        }

        // Se os elementos existirem, usa a calculadora
        pesoFetalInput.value = peso;
        igSemanasInput.value = igSemanas;
        igDiasInput.value = igDias;

        // Simula o clique no botão da calculadora
        calcularBtn.click();

        // Pega o resultado da calculadora
        const resultadoPercentil = document.getElementById('resultadoPercentil')?.textContent;
        const percentil = resultadoPercentil?.match(/Percentil: (\d+)/)?.[1] || '';

        // Atualiza o campo de percentil no USG
        grupo.querySelector('.usg-percentil').value = percentil;
    },

    alternarTipoAdmissao: () => {
        const tipo = document.getElementById('tipoAdmissao').value;
        document.getElementById('novaAdmissao').style.display = tipo === 'nova' ? 'block' : 'none';
        document.getElementById('admissaoExistente').style.display = tipo === 'existente' ? 'block' : 'none';
    },

    adicionarExameUSG: () => {
        const container = document.getElementById('examesImagem');
        const grupos = container.getElementsByClassName('exame-usg-grupo');
        const novoIndex = grupos.length;
        
        const novoGrupo = grupos[0].cloneNode(true);
        novoGrupo.dataset.index = novoIndex;
        
        // Limpa os valores dos campos
        novoGrupo.querySelectorAll('input, select, textarea').forEach(input => {
            input.value = '';
        });
        
        // Adiciona listener para mostrar/esconder seção Doppler
        const tipoSelect = novoGrupo.querySelector('.usg-tipo');
        const dopplerSection = novoGrupo.querySelector('.doppler-section');
        tipoSelect.addEventListener('change', () => {
            dopplerSection.style.display = tipoSelect.value.includes('DOPPLER') ? 'block' : 'none';
        });
        
        container.appendChild(novoGrupo);
    },

    removerUltimoExameUSG: () => {
        const container = document.getElementById('examesImagem');
        const grupos = container.getElementsByClassName('exame-usg-grupo');
        if (grupos.length > 1) {
            container.removeChild(grupos[grupos.length - 1]);
        }
    },

    adicionarParametro: () => {
        const container = document.getElementById('parametros24h');
        const grupos = container.getElementsByClassName('parametro-grupo');
        const novoIndex = grupos.length;
        
        const novoGrupo = grupos[0].cloneNode(true);
        novoGrupo.dataset.index = novoIndex;
        
        // Limpa os valores dos campos
        novoGrupo.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
        });
        
        container.appendChild(novoGrupo);
    },

    removerUltimoParametro: () => {
        const container = document.getElementById('parametros24h');
        const grupos = container.getElementsByClassName('parametro-grupo');
        if (grupos.length > 1) {
            container.removeChild(grupos[grupos.length - 1]);
        }
    },

    adicionarExameLab: () => {
        const container = document.getElementById('examesLaboratoriais');
        const grupos = container.getElementsByClassName('exame-lab-grupo');
        const novoIndex = grupos.length;
        
        const novoGrupo = grupos[0].cloneNode(true);
        novoGrupo.dataset.index = novoIndex;
        
        // Limpa os valores dos campos
        novoGrupo.querySelectorAll('input, select').forEach(input => {
            input.value = '';
        });
        
        container.appendChild(novoGrupo);
    },

    removerUltimoExameLab: () => {
        const container = document.getElementById('examesLaboratoriais');
        const grupos = container.getElementsByClassName('exame-lab-grupo');
        if (grupos.length > 1) {
            container.removeChild(grupos[grupos.length - 1]);
        }
    },

    gerarEvolucao: () => {
        let evolucao = '';

        // ID
        const nome = document.getElementById('nomePaciente')?.value?.toUpperCase() || '';
        const idade = document.getElementById('idadePaciente')?.value || '';
        const procedencia = document.getElementById('procedencia')?.value?.toUpperCase() || '';
        evolucao += `#ID: ${nome}, ${idade} ANOS, PROCEDENTE DE ${procedencia}\n`;

        // História Obstétrica e IG
        const g = document.getElementById('g')?.value || '';
        const p = document.getElementById('p')?.value || '';
        const a = document.getElementById('a')?.value || '';
        const partos = document.getElementById('partos')?.value?.toUpperCase() || '';
        
        let historicoObstetrico = '';
        if (g) historicoObstetrico += `G${g}`;
        if (p) historicoObstetrico += `P${p}`;
        if (a) historicoObstetrico += `A${a}`;
        if (partos) historicoObstetrico += ` (${partos})`;

        const dumData = document.getElementById('dumEvolucao')?.value;
        const dumIncerta = document.getElementById('dumIncerta')?.checked;
        const dataResolucao = document.getElementById('dataResolucao')?.value;
        
        const dataUsg = document.getElementById('dataUsgEvolucao')?.value;
        const igUsgSemanas = document.getElementById('igUsgEvolucaoSemanas')?.value;
        const igUsgDias = document.getElementById('igUsgEvolucaoDias')?.value;

        if (historicoObstetrico) evolucao += `${historicoObstetrico}`;
        
        if (dataResolucao) {
            // Se tem data de resolução, usar IGR
            if (dumData) {
                const igr = diferencaDatas(dumData, dataResolucao);
                evolucao += `, IGR DUM (${formatarDataAbreviada(dumData)})${dumIncerta ? ' INCERTA' : ''}: ${igr.semanas}S${igr.dias}D`;
            }
            if (dataUsg && igUsgSemanas) {
                const igr = diferencaDatas(dataUsg, dataResolucao);
                evolucao += `, IGR USG (${formatarDataAbreviada(dataUsg)} - ${igUsgSemanas}S${igUsgDias || 0}D): ${igr.semanas}S${igr.dias}D`;
            }
        } else {
            // Se não tem data de resolução, usar IG normal
            if (dumData) {
                const ig = diferencaDatas(dumData, new Date());
                evolucao += `, IG DUM (${formatarDataAbreviada(dumData)})${dumIncerta ? ' INCERTA' : ''}: ${ig.semanas}S${ig.dias}D`;
            }
            if (dataUsg && igUsgSemanas) {
                const ig = diferencaDatas(dataUsg, new Date());
                evolucao += `, IG USG (${formatarDataAbreviada(dataUsg)} - ${igUsgSemanas}S${igUsgDias || 0}D): ${ig.semanas}S${ig.dias}D`;
            }
        }
        evolucao += '\n';

        // HD
        const diagnosticos = document.getElementById('diagnosticos')?.value?.toUpperCase() || '';
        if (diagnosticos) evolucao += `\n#HD: ${diagnosticos}\n`;

        // Antibióticos
        const antibioticosUso = document.getElementById('antibioticosUso')?.value?.toUpperCase();
        if (antibioticosUso) {
            evolucao += '\n#ANTIMICROBIANOS:\n';
            evolucao += `- EM USO: ${antibioticosUso}\n`;
        }

        // Medicações
        const medicacoes = document.getElementById('medicacoes')?.value?.toUpperCase();
        if (medicacoes) {
            evolucao += `\n#EM USO: ${medicacoes}\n`;
        }

        // Alergias
        const alergias = document.getElementById('alergias')?.value?.toUpperCase();
        if (alergias) {
            evolucao += `\n#ALERGIAS: ${alergias}\n`;
        }

        // Admissão
        const tipoAdmissao = document.getElementById('tipoAdmissao')?.value;
        if (tipoAdmissao === 'existente') {
            const admissaoCopiada = document.getElementById('admissaoCopiada')?.value?.toUpperCase();
            if (admissaoCopiada) {
                evolucao += `\n${admissaoCopiada}\n`;
            }
        }

        // Em Tempo
        const emTempo = document.getElementById('emTempo')?.value?.toUpperCase();
        if (emTempo) {
            evolucao += `\n#EM TEMPO: ${emTempo}\n`;
        }

        // Evolução
        evolucao += '\n#EVOLUÇÃO:\n';
        const consciencia = document.getElementById('consciencia')?.value || '';
        const interacao = document.getElementById('interacao')?.value?.toUpperCase() || '';
        let interacaoTexto = interacao === 'BOA' ? 'BEM' : 
                            interacao === 'REGULAR' ? 'REGULARMENTE' :
                            interacao === 'RUIM' ? 'MAL' :
                            interacao === 'NAO INTERAGE' ? 'NÃO' : interacao.toLowerCase();
        evolucao += `PACIENTE AVALIADA EM LEITO DE ENFERMARIA, ${consciencia}, INTERAGINDO ${interacaoTexto} COM EXAMINADOR. `;

        const deambulacao = document.getElementById('deambulacao')?.value?.toUpperCase();
        if (deambulacao === 'SEM AUXILIO') {
            evolucao += `DEAMBULA SEM AUXÍLIO. `;
        } else if (deambulacao === 'COM AUXILIO') {
            evolucao += `DEAMBULA COM AUXÍLIO. `;
        } else if (deambulacao === 'RESTRITA') {
            evolucao += `RESTRITA AO LEITO. `;
        } else if (deambulacao === 'REPOUSO') {
            evolucao += `EM REPOUSO RELATIVO. `;
        } else if (deambulacao === 'ABSOLUTO') {
            evolucao += `EM REPOUSO ABSOLUTO. `;
        }

        const respiracao = document.getElementById('respiracao')?.value?.toUpperCase();
        if (respiracao === 'NORMAL') {
            evolucao += `RESPIRAÇÃO ESPONTÂNEA EM AR AMBIENTE, SEM DESCONFORTO RESPIRATÓRIO. `;
        } else if (respiracao) {
            evolucao += `${respiracao}. `;
        }

        const dieta = document.getElementById('dieta')?.value?.toUpperCase();
        if (dieta) {
            if (dieta === 'ORAL BOA') {
                evolucao += `EM DIETA ORAL, COM BOA ACEITAÇÃO. `;
            } else if (dieta === 'ORAL PARCIAL') {
                evolucao += `EM DIETA ORAL, COM ACEITAÇÃO PARCIAL. `;
            } else if (dieta === 'ZERO') {
                evolucao += `EM DIETA ZERO. `;
            } else if (dieta === 'NAO ACEITA') {
                evolucao += `NÃO ACEITA DIETA. `;
            } else if (dieta === 'NAUSEAS') {
                evolucao += `COM NÁUSEAS. `;
            } else if (dieta === 'VOMITOS') {
                evolucao += `COM VÔMITOS. `;
            }
        }

        const eliminacoes = document.getElementById('eliminacoes')?.value?.toUpperCase();
        if (eliminacoes === 'NORMAIS') {
            evolucao += `DIURESE E EVACUAÇÕES PRESENTES E FISIOLÓGICAS. `;
        } else if (eliminacoes === 'ALTERADAS') {
            evolucao += `ELIMINAÇÕES FISIOLÓGICAS ALTERADAS. `;
        } else if (eliminacoes === 'AUSENTES') {
            evolucao += `ELIMINAÇÕES FISIOLÓGICAS AUSENTES. `;
        } else if (eliminacoes === 'SO DIURESE') {
            evolucao += `APENAS COM DIURESE PRESENTE. `;
        } else if (eliminacoes === 'SO EVACUACAO') {
            evolucao += `APENAS COM EVACUAÇÃO PRESENTE. `;
        } else if (eliminacoes === 'CONSTIPACAO') {
            evolucao += `REFERE CONSTIPAÇÃO. `;
        } else if (eliminacoes === 'DIARREIA') {
            evolucao += `REFERE DIARREIA. `;
        }

        const sangramentos = document.getElementById('sangramentos')?.value?.toUpperCase();
        if (sangramentos && sangramentos !== 'SEM') {
            if (sangramentos === 'SANGRAMENTO') {
                evolucao += `COM SANGRAMENTO VAGINAL. `;
            } else if (sangramentos === 'LA') {
                evolucao += `COM PERDA DE LA. `;
            } else if (sangramentos === 'AMBOS') {
                evolucao += `COM SANGRAMENTO VAGINAL E PERDA DE LA. `;
            }
        }

        if (document.getElementById('semQueixas')?.checked) {
            evolucao += "NO MOMENTO SEM QUEIXAS.";
        } else {
            let temQueixas = false;
            // Queixas
            const refere = document.getElementById('refere')?.value?.trim()?.toUpperCase();
            if (refere) {
                evolucao += `REFERE ${refere}. `;
                temQueixas = true;
            }

            const queixaSe = document.getElementById('queixaSe')?.value?.trim()?.toUpperCase();
            if (queixaSe) {
                evolucao += `QUEIXA-SE DE ${queixaSe}. `;
                temQueixas = true;
            }

            const nega = document.getElementById('nega')?.value?.trim()?.toUpperCase();
            if (nega) {
                evolucao += `NEGA ${nega}. `;
                temQueixas = true;
            }

            if (!temQueixas || document.getElementById('semDemaisQueixas')?.checked) {
                evolucao += "SEM DEMAIS QUEIXAS.";
            }
        }

        evolucao += '\n\n#EXAME FÍSICO\n';

        // ECT
        const ectEg = document.getElementById('ectEg')?.value || 'BOM';
        let ect = `- ECT: EG ${ectEg.toUpperCase()}`;
        if (document.getElementById('ectCorada')?.checked) ect += ', CORADA';
        if (document.getElementById('ectHidratada')?.checked) ect += ', HIDRATADA';
        if (document.getElementById('ectAcianótica')?.checked) ect += ', ACIANÓTICA';
        if (document.getElementById('ectAnictérica')?.checked) ect += ', ANICTÉRICA';
        const ectOutros = document.getElementById('ectOutros')?.value?.trim()?.toUpperCase();
        if (ectOutros) ect += `, ${ectOutros}`;
        evolucao += ect + '.\n';

        // MAMAS
        const mamasStatus = document.getElementById('mamasStatus')?.value;
        if (mamasStatus) {
            let mamas = `- MAMAS: ${mamasStatus.toUpperCase()}`;
            if (document.getElementById('mamasFlogisticos')?.checked) mamas += ', COM SINAIS FLOGÍSTICOS';
            if (document.getElementById('mamasIncomodos')?.checked) mamas += ', COM INCÔMODOS';
            const mamasOutros = document.getElementById('mamasOutros')?.value?.trim()?.toUpperCase();
            if (mamasOutros) mamas += `, ${mamasOutros}`;
            evolucao += mamas + '.\n';
        }

        // ABDOME
        const abdTipo = document.getElementById('abdTipo')?.value;
        if (abdTipo) {
            let abdome = `- ABD: ${abdTipo.toUpperCase()}`;
            if (document.getElementById('abdNormotimpanico')?.checked) abdome += ', NORMOTIMPÂNICO';
            if (document.getElementById('abdRha')?.checked) abdome += ', RHA +';
            if (document.getElementById('abdIndolor')?.checked) abdome += ', INDOLOR À PALPAÇÃO';
            if (document.getElementById('abdDoloroso')?.checked) abdome += ', DOLOROSO À PALPAÇÃO';
            if (document.getElementById('abdFlogisticos')?.checked) abdome += ', COM SINAIS FLOGÍSTICOS';
            if (document.getElementById('abdIrritacao')?.checked) abdome += ', COM SINAIS DE IRRITAÇÃO PERITONEAL';
            if (document.getElementById('abdVisceras')?.checked) abdome += ', SEM VISCEROMEGALIAS PALPÁVEIS';
            
            const afu = document.getElementById('afu')?.value?.trim()?.toUpperCase();
            if (afu) abdome += `, AFU ${afu}`;
            
            const foStatus = document.getElementById('foStatus')?.value;
            if (foStatus) {
                abdome += `, FO ${foStatus.toUpperCase()}`;
                if (document.getElementById('foFlogisticos')?.checked) {
                    abdome += ' COM SINAIS FLOGÍSTICOS';
                }
            }
            
            const abdOutros = document.getElementById('abdOutros')?.value?.trim()?.toUpperCase();
            if (abdOutros) abdome += `, ${abdOutros}`;
            evolucao += abdome + '.\n';
        }

        // GINECOLÓGICO
        const ginStatus = document.getElementById('ginStatus')?.value;
        if (ginStatus) {
            let gin = `- GIN: ${ginStatus.toUpperCase()}`;
            if (document.getElementById('ginFisiologico')?.checked) gin += ' E FISIOLÓGICO';
            if (document.getElementById('ginFlogisticos')?.checked) gin += ', COM SINAIS FLOGÍSTICOS';
            const ginOutros = document.getElementById('ginOutros')?.value?.trim()?.toUpperCase();
            if (ginOutros) gin += `, ${ginOutros}`;
            evolucao += gin + '.\n';
        }

        // EXTREMIDADES
        const extStatus = document.getElementById('extStatus')?.value;
        if (extStatus) {
            let ext = `- EXTREMIDADES: `;
            if (document.getElementById('extMmii')?.checked) ext += 'MMII ';
            ext += extStatus.toUpperCase();
            if (document.getElementById('extEdemaLeve')?.checked) ext += ', COM LEVE EDEMA';
            else if (document.getElementById('extEdema')?.checked) ext += ', COM EDEMA';
            if (document.getElementById('extTvp')?.checked) ext += ', COM SINAIS DE TVP';
            if (document.getElementById('extDor')?.checked) ext += ', COM DOR';
            const extOutros = document.getElementById('extOutros')?.value?.trim()?.toUpperCase();
            if (extOutros) ext += `, ${extOutros}`;
            evolucao += ext + '.\n';
        }

        // Parâmetros das últimas 24h
        const parametros = geradores.formatarParametros24h();
        if (parametros) evolucao += parametros;

        // Exames Complementares
        const examesLab = geradores.formatarExamesLab();
        const examesUsg = geradores.formatarExamesUSG();
        if (examesLab || examesUsg) {
            evolucao += '\n#EXAMES COMPLEMENTARES:\n';
            if (examesLab) evolucao += examesLab;
            if (examesUsg) evolucao += examesUsg;
        }

        // Condutas
        const conduta = document.getElementById('conduta')?.value?.toUpperCase();
        if (conduta) {
            evolucao += '\n#CONDUTAS DISCUTIDAS EM VISITA:\n';
            evolucao += conduta.split('\n').map(linha => `- ${linha.trim()}`).join('\n');
            evolucao += '\n';
        }

        // Mostra o resultado
        const resultado = document.getElementById('evolucaoGerada');
        if (resultado) {
            resultado.textContent = evolucao;
            resultado.classList.add('show');
        }
    },

    gerarAdmissao: () => {
        const tipo = document.getElementById('tipoAdmissao').value;
        
        if (tipo === 'existente') {
            const textoAdmissao = document.getElementById('admissaoCopiada').value;
            if (textoAdmissao) {
                const resultado = document.getElementById('admissaoGerada');
                resultado.textContent = textoAdmissao;
                resultado.classList.add('show');
            }
            return;
        }

        // Coleta os dados do formulário de admissão
        const dados = {
            data: document.getElementById('dataAdmissao').value,
            hda: document.getElementById('hda').value.toUpperCase(),
            hpp: document.getElementById('hpp').value.toUpperCase(),
            medicacoesUso: document.getElementById('medicacoesUso').value.toUpperCase(),
            pn: document.getElementById('pn').value.toUpperCase(),
            usgObstetrico: document.getElementById('usgObstetrico').value.toUpperCase(),
            exameAdmissao: document.getElementById('exameAdmissao').value.toUpperCase()
        };

        const dataFormatada = formatarData(dados.data);
        const dataAbreviada = formatarDataAbreviada(dados.data);

        // Gera o texto da admissão
        let admissao = `#ADMISSÃO MÉDICA ${dataFormatada}\n`;
        
        // HDA
        if (dados.hda) {
            admissao += `#HDA ${dataAbreviada}: ${dados.hda}\n`;
        }

        // HPP
        if (dados.hpp) {
            admissao += `#HPP: ${dados.hpp}\n`;
        }

        // Medicações em Uso
        if (dados.medicacoesUso) {
            admissao += `#EM USO: ${dados.medicacoesUso}\n`;
        }

        // Pré-Natal
        if (dados.pn) {
            admissao += `#PN: ${dados.pn}\n`;
        }

        // USG Obstétrico
        if (dados.usgObstetrico) {
            admissao += `#USG OBSTÉTRICO: ${dados.usgObstetrico}\n`;
        }

        // Exame Físico
        if (dados.exameAdmissao) {
            admissao += `#EXAME FÍSICO:\n`;
            // Formata o exame físico em tópicos
            const exame = dados.exameAdmissao
                .split('\n')
                .map(linha => linha.trim())
                .filter(linha => linha)
                .map(linha => `- ${linha}`)
                .join('\n');
            admissao += exame;
        }

        // Mostra o resultado
        const resultado = document.getElementById('admissaoGerada');
        resultado.textContent = admissao;
        resultado.classList.add('show');
    },

    copiarAdmissao: () => {
        const texto = document.getElementById('admissaoGerada').textContent;
        if (texto) {
            navigator.clipboard.writeText(texto)
                .then(() => alert('Admissão copiada para a área de transferência!'))
                .catch(err => alert('Erro ao copiar: ' + err));
        }
    },

    copiarEvolucao: () => {
        const texto = document.getElementById('evolucaoGerada').textContent;
        if (texto) {
            navigator.clipboard.writeText(texto)
                .then(() => alert('Evolução copiada para a área de transferência!'))
                .catch(err => alert('Erro ao copiar: ' + err));
        }
    },

    formatarParametros24h: () => {
        const grupos = document.getElementsByClassName('parametro-grupo');
        if (!grupos.length) return '';

        let parametrosTexto = '\n\n#PARÂMETROS 24H:\n';
        let dataAtual = '';
        
        Array.from(grupos).forEach(grupo => {
            const data = grupo.querySelector('.param-data').value;
            if (!data) return;

            const dataFormatada = formatarData(data);
            if (dataFormatada !== dataAtual) {
                dataAtual = dataFormatada;
                parametrosTexto += `${dataFormatada}\n`;
            }

            const hora = grupo.querySelector('.param-hora').value;
            const horaFormatada = hora ? hora.replace(':', 'h') : '';

            const pa = grupo.querySelector('.param-pa').value;
            const temp = grupo.querySelector('.param-temp').value;
            const bcf = grupo.querySelector('.param-bcf').value;
            const fc = grupo.querySelector('.param-fc').value;
            const fr = grupo.querySelector('.param-fr').value;
            const sat = grupo.querySelector('.param-sat').value;
            const obs = grupo.querySelector('.param-obs').value;

            let linha = horaFormatada ? `${horaFormatada}: ` : '';
            
            const params = [];
            if (pa) params.push(`PA-${pa}mmhg`);
            if (temp) params.push(`T-${temp}ºC`);
            if (bcf) params.push(`BCF-${bcf}bpm`);
            if (fc) params.push(`FC-${fc}bpm`);
            if (fr) params.push(`FR-${fr}irpm`);
            if (sat) params.push(`Sat-${sat}%`);

            if (params.length) {
                linha += params.join(', ');
            }

            if (linha) parametrosTexto += `${linha}\n`;
            if (obs) parametrosTexto += `${obs}\n`;
        });

        return parametrosTexto;
    },

    formatarExamesLab: () => {
        const grupos = document.getElementsByClassName('exame-lab-grupo');
        if (!grupos.length) return '';

        let examesTexto = '\n#EXAMES LABORATORIAIS\n';
        
        Array.from(grupos).forEach(grupo => {
            const data = grupo.querySelector('.lab-data').value;
            if (!data) return;

            const dataFormatada = formatarData(data);
            let linha = `-LAB ${dataFormatada}: `;
            
            // Hemograma
            const hb = grupo.querySelector('.lab-hb').value;
            const ht = grupo.querySelector('.lab-ht').value;
            const leuco = grupo.querySelector('.lab-leuco').value;
            const segPerc = grupo.querySelector('.lab-seg-perc').value;
            const segAbs = grupo.querySelector('.lab-seg-abs').value;
            const plaq = grupo.querySelector('.lab-plaq').value;

            const params = [];
            if (hb) params.push(`HB ${hb}`);
            if (ht) params.push(`HT ${ht}`);
            if (leuco) params.push(`LEUCO ${leuco}`);
            if (segPerc && segAbs) params.push(`SEGMENTADOS ${segPerc}% (${segAbs})`);
            if (plaq) params.push(`PLAQ ${plaq}MIL`);

            // Bioquímica
            const pcr = grupo.querySelector('.lab-pcr').value;
            const glicose = grupo.querySelector('.lab-glicose').value;
            const ureia = grupo.querySelector('.lab-ureia').value;
            const creat = grupo.querySelector('.lab-creat').value;
            const au = grupo.querySelector('.lab-au').value;

            if (pcr) params.push(`PCR ${pcr}`);
            if (glicose) params.push(`GLICOSE ${glicose}`);
            if (ureia) params.push(`UR ${ureia}`);
            if (creat) params.push(`CR ${creat}`);
            if (au) params.push(`AU ${au}`);

            // Função Hepática
            const tgo = grupo.querySelector('.lab-tgo').value;
            const tgp = grupo.querySelector('.lab-tgp').value;
            const bt = grupo.querySelector('.lab-bt').value;
            const ldh = grupo.querySelector('.lab-ldh').value;

            if (tgo) params.push(`TGO ${tgo}`);
            if (tgp) params.push(`TGP ${tgp}`);
            if (bt) params.push(`BT ${bt}`);
            if (ldh) params.push(`LDH ${ldh}`);

            // Proteinúria
            const protUr = grupo.querySelector('.lab-prot-ur').value;
            const creatUr = grupo.querySelector('.lab-creat-ur').value;
            const relPc = grupo.querySelector('.lab-rel-pc').value;

            if (protUr) params.push(`PTN UR ${protUr}`);
            if (creatUr) params.push(`CR UR ${creatUr}`);
            if (relPc) params.push(`RELAÇÃO PC ${relPc}`);

            // Sorologias
            const vdrl = grupo.querySelector('.lab-vdrl').value;
            const hbsag = grupo.querySelector('.lab-hbsag').value;
            const hcv = grupo.querySelector('.lab-hcv').value;

            if (vdrl) params.push(`VDRL ${vdrl}`);
            if (hbsag) params.push(`HBsAg ${hbsag}`);
            if (hcv) params.push(`ANTI-HCV ${hcv}`);

            // EAS
            const easStatus = grupo.querySelector('.lab-eas-status').value;
            const easHemacias = grupo.querySelector('.lab-eas-hemacias').value;
            const easLeucocitos = grupo.querySelector('.lab-eas-leucocitos').value;
            const easObs = grupo.querySelector('.lab-eas-obs').value;

            if (easStatus === 'NORMAL') {
                params.push(`EAS NORMAL`);
                if (easHemacias) params.push(`(${easHemacias}HM POR CAMPO)`);
            } else if (easStatus === 'ALTERADO') {
                let easTexto = 'EAS';
                if (easLeucocitos) easTexto += ` LEUCÓCITOS ++ (${easLeucocitos} POR CAMPO)`;
                if (easObs) easTexto += ` / ${easObs}`;
                params.push(easTexto);
            }

            linha += params.join(' | ');
            examesTexto += linha + '\n';
        });

        return examesTexto;
    },

    formatarExamesUSG: () => {
        const grupos = document.getElementsByClassName('exame-usg-grupo');
        if (!grupos.length) return '';

        let examesTexto = '\n#EXAMES DE IMAGEM\n';
        
        Array.from(grupos).forEach(grupo => {
            const data = grupo.querySelector('.usg-data').value;
            if (!data) return;

            const dataFormatada = formatarData(data);
            const tipo = grupo.querySelector('.usg-tipo').value;
            
            let linha = `- #${tipo} (${dataFormatada}): `;
            
            // Dados básicos
            const apresentacao = grupo.querySelector('.usg-apresentacao').value;
            const situacao = grupo.querySelector('.usg-situacao').value;
            const posicao = grupo.querySelector('.usg-posicao').value;
            const dorso = grupo.querySelector('.usg-dorso').value;
            
            const params = [];
            if (apresentacao) params.push(apresentacao);
            if (situacao) params.push(situacao);
            if (posicao) params.push(posicao);
            if (dorso) params.push(`DORSO ${dorso}`);

            // Dados fetais
            const bcf = grupo.querySelector('.usg-bcf').value;
            const sexo = grupo.querySelector('.usg-sexo').value;
            const movimentacao = grupo.querySelector('.usg-movimentacao').value;

            if (bcf) params.push(`BCF ${bcf} BPM`);
            if (sexo) params.push(`SEXO ${sexo}`);
            if (movimentacao) params.push(movimentacao);

            // Biometria
            const igSemanas = grupo.querySelector('.usg-ig-semanas').value;
            const igDias = grupo.querySelector('.usg-ig-dias').value;
            const peso = grupo.querySelector('.usg-peso').value;
            const percentil = grupo.querySelector('.usg-percentil').value;

            if (peso) {
                let pesoTexto = `PESO ${peso}G`;
                if (percentil) pesoTexto += ` (PERCENTIL ${percentil})`;
                params.push(pesoTexto);
            }

            // Líquido e Placenta
            const ila = grupo.querySelector('.usg-ila').value;
            const placentaLocal = grupo.querySelector('.usg-placenta-local').value;
            const placentaGrau = grupo.querySelector('.usg-placenta-grau').value;

            if (placentaLocal || placentaGrau) {
                let placentaTexto = 'PLACENTA';
                if (placentaLocal) placentaTexto += ` ${placentaLocal}`;
                if (placentaGrau) placentaTexto += `, ${placentaGrau}`;
                params.push(placentaTexto);
            }
            if (ila) params.push(`ILA ${ila}`);

            // IG
            if (igSemanas) {
                let igTexto = `IG: ${igSemanas}S`;
                if (igDias) igTexto += `${igDias}D`;
                params.push(igTexto);
            }

            // Doppler
            if (tipo.includes('DOPPLER')) {
                const irUmbilical = grupo.querySelector('.usg-ir-umbilical').value;
                const irCerebral = grupo.querySelector('.usg-ir-cerebral').value;
                const ipMedio = grupo.querySelector('.usg-ip-medio').value;
                const ipPercentil = grupo.querySelector('.usg-ip-percentil').value;
                const relacaoCP = grupo.querySelector('.usg-relacao-cp').value;
                const rcpPercentil = grupo.querySelector('.usg-rcp-percentil').value;

                if (irUmbilical) params.push(`ARTÉRIA UMBILICAL IR = ${irUmbilical}`);
                if (irCerebral) params.push(`ARTÉRIA CEREBRAL MÉDIA = ${irCerebral}`);
                if (ipMedio) params.push(`IP MÉDIO DAS AAUU: ${ipMedio} (PERCENTIL ${ipPercentil}%)`);
                if (relacaoCP) params.push(`RELAÇÃO CÉREBRO PLACENTÁRIA: ${relacaoCP} (PERCENTIL ${rcpPercentil}%)`);
            }

            linha += params.join(' | ');

            // Conclusão
            const conclusao = grupo.querySelector('.usg-conclusao').value.trim();
            if (conclusao) {
                linha += `\nCONCLUSÃO: ${conclusao}`;
            }

            examesTexto += linha + '\n\n';
        });

        return examesTexto;
    },

    gerarPrescricao: () => {
        const conteudo = prescricao.gerarConteudoPrescricao();
        
        try {
            // Cria o PDF
            const doc = new jsPDF();
            
            // Configura a fonte com tamanho menor
            doc.setFont('helvetica');
            doc.setFontSize(10); // Reduzido de 12 para 10
            
            // Define margens e largura útil
            const margemEsquerda = 20;
            const margemDireita = 20;
            const larguraUtil = doc.internal.pageSize.width - margemEsquerda - margemDireita;
            
            // Adiciona o conteúdo
            const linhas = conteudo.split('\n');
            let y = 20;
            
            linhas.forEach(linha => {
                if (y > 270) { // Se próximo do fim da página
                    doc.addPage();
                    y = 20;
                }
                
                if (linha.trim()) {
                    // Verifica se é um título de via de administração ou título principal
                    if (linha.includes('USO') || linha.includes('RECEITUÁRIO MÉDICO')) {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(12); // Mantém títulos em tamanho 12
                        // Centraliza o texto
                        const larguraTexto = doc.getStringUnitWidth(linha.trim()) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                        const xCentralizado = (doc.internal.pageSize.width - larguraTexto) / 2;
                        doc.text(linha.trim(), xCentralizado, y);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10); // Volta para tamanho 10
                    } else if (linha.includes('NOME:')) {
                        // Títulos principais
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(11); // Nome do paciente em tamanho 11
                        doc.text(linha, margemEsquerda, y);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10); // Volta para tamanho 10
                    } else if (linha.includes('-----')) {
                        // Linhas com medicação e quantidade
                        const [medicacao, quantidade] = linha.split('-----');
                        const medicacaoFormatada = medicacao.trim();
                        const quantidadeFormatada = quantidade.trim();
                        
                        // Calcula posição da quantidade para alinhar à direita
                        const larguraMedicacao = doc.getStringUnitWidth(medicacaoFormatada) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                        if (larguraMedicacao > larguraUtil - 40) { // Se o nome da medicação for muito longo
                            doc.text(medicacaoFormatada, margemEsquerda, y);
                            y += 6; // Reduzido o espaçamento de 7 para 6
                            doc.text(quantidadeFormatada, margemEsquerda, y);
                        } else {
                            doc.text(medicacaoFormatada, margemEsquerda, y);
                            doc.text(quantidadeFormatada, doc.internal.pageSize.width - margemDireita - doc.getStringUnitWidth(quantidadeFormatada) * doc.internal.getFontSize() / doc.internal.scaleFactor, y);
                        }
                    } else {
                        // Instruções e outros textos
                        const palavras = linha.split(' ');
                        let linhaAtual = '';
                        
                        for (let palavra of palavras) {
                            const linhaTest = linhaAtual + (linhaAtual ? ' ' : '') + palavra;
                            const larguraLinha = doc.getStringUnitWidth(linhaTest) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                            
                            if (larguraLinha > larguraUtil) {
                                doc.text(linhaAtual, margemEsquerda, y);
                                y += 6; // Reduzido o espaçamento de 7 para 6
                                linhaAtual = palavra;
                            } else {
                                linhaAtual = linhaTest;
                            }
                        }
                        
                        if (linhaAtual) {
                            doc.text(linhaAtual, margemEsquerda, y);
                        }
                    }
                }
                y += 6; // Reduzido o espaçamento de 7 para 6
            });
            
            // Salva o PDF
            doc.save('receituario.pdf'); // Alterado nome do arquivo
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        }
    }
};

// Objeto prescricao com todas as funções de prescrição
const prescricao = {
    // Definições de medicações padrão
    medicacoesPadrao: {
        // Analgésicos e Antitérmicos
        'paracetamol': {
            nome: 'PARACETAMOL',
            concentracao: '500mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 6/6 horas se dor ou febre. Máximo de 4 comprimidos por dia.'
        },
        'paracetamol-750': {
            nome: 'PARACETAMOL',
            concentracao: '750mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 6/6 horas se dor ou febre. Máximo de 4 comprimidos por dia.'
        },
        'paracetamol-gotas': {
            nome: 'PARACETAMOL',
            concentracao: '200mg/mL',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 40 gotas de 6/6 horas se dor ou febre.'
        },
        'dipirona': {
            nome: 'DIPIRONA',
            concentracao: '500mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 6/6 horas se dor ou febre.'
        },
        'dipirona-gotas': {
            nome: 'DIPIRONA',
            concentracao: '500mg/mL',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 40 gotas de 6/6 horas se dor ou febre.'
        },
        'dipirona-injetavel': {
            nome: 'DIPIRONA',
            concentracao: '1g/2mL',
            via: 'USO INTRAMUSCULAR',
            apresentacao: 'ampola',
            quantidade: 5,
            unidade: 'amp',
            instrucoes: 'Aplicar 01 ampola intramuscular de 6/6 horas se dor ou febre.'
        },

        // Antieméticos
        'metoclopramida': {
            nome: 'METOCLOPRAMIDA',
            concentracao: '10mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas se náusea ou vômito.'
        },
        'metoclopramida-gotas': {
            nome: 'METOCLOPRAMIDA',
            concentracao: '4mg/mL',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 20 gotas de 8/8 horas se náusea ou vômito.'
        },
        'metoclopramida-injetavel': {
            nome: 'METOCLOPRAMIDA',
            concentracao: '10mg/2mL',
            via: 'USO INTRAMUSCULAR',
            apresentacao: 'ampola',
            quantidade: 5,
            unidade: 'amp',
            instrucoes: 'Aplicar 01 ampola intramuscular de 8/8 horas se náusea ou vômito intensos.'
        },
        'ondansetrona': {
            nome: 'ONDANSETRONA',
            concentracao: '4mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas se náusea ou vômito.'
        },
        'ondansetrona-8': {
            nome: 'ONDANSETRONA',
            concentracao: '8mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 12/12 horas se náusea ou vômito.'
        },
        'ondansetrona-injetavel': {
            nome: 'ONDANSETRONA',
            concentracao: '8mg/4mL',
            via: 'USO ENDOVENOSO',
            apresentacao: 'ampola',
            quantidade: 5,
            unidade: 'amp',
            instrucoes: 'Aplicar 01 ampola endovenosa de 8/8 horas se náusea ou vômito intensos.'
        },
        'dimenidrinato': {
            nome: 'DIMENIDRINATO',
            concentracao: '50mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas se náusea ou vômito.'
        },
        'meclin': {
            nome: 'MECLIZINA (MECLIN)',
            concentracao: '25mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas se náusea ou tontura.'
        },

        // Antiespasmódicos
        'buscopan': {
            nome: 'BUTILBROMETO DE ESCOPOLAMINA (BUSCOPAN)',
            concentracao: '10mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas se cólica ou dor abdominal.'
        },
        'buscopan-duo': {
            nome: 'BUTILBROMETO DE ESCOPOLAMINA + DIPIRONA (BUSCOPAN DUO)',
            concentracao: '10mg + 250mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas se cólica ou dor abdominal.'
        },
        'buscopan-gotas': {
            nome: 'BUTILBROMETO DE ESCOPOLAMINA (BUSCOPAN)',
            concentracao: '10mg/mL',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 20 gotas de 8/8 horas se cólica ou dor abdominal.'
        },
        'buscopan-injetavel': {
            nome: 'BUTILBROMETO DE ESCOPOLAMINA (BUSCOPAN)',
            concentracao: '20mg/mL',
            via: 'USO INTRAMUSCULAR',
            apresentacao: 'ampola',
            quantidade: 5,
            unidade: 'amp',
            instrucoes: 'Aplicar 01 ampola intramuscular de 8/8 horas se cólica ou dor abdominal intensa.'
        },
        'buscopan-duo-injetavel': {
            nome: 'BUTILBROMETO DE ESCOPOLAMINA + DIPIRONA (BUSCOPAN DUO)',
            concentracao: '4mg + 500mg/mL',
            via: 'USO INTRAMUSCULAR',
            apresentacao: 'ampola',
            quantidade: 5,
            unidade: 'amp',
            instrucoes: 'Aplicar 01 ampola intramuscular de 8/8 horas se cólica ou dor abdominal intensa.'
        },

        // Antibióticos
        'cefalexina': {
            nome: 'CEFALEXINA',
            concentracao: '500mg',
            via: 'USO ORAL',
            apresentacao: 'cápsula',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 cápsula de 6/6 horas por 7 dias.'
        },
        'cefalexina-suspensao': {
            nome: 'CEFALEXINA',
            concentracao: '250mg/5mL',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 10mL de 6/6 horas por 7 dias.'
        },
        'amoxicilina': {
            nome: 'AMOXICILINA',
            concentracao: '500mg',
            via: 'USO ORAL',
            apresentacao: 'cápsula',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 cápsula de 8/8 horas por 7 dias.'
        },
        'amoxicilina-suspensao': {
            nome: 'AMOXICILINA',
            concentracao: '250mg/5mL',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 10mL de 8/8 horas por 7 dias.'
        },
        'azitromicina': {
            nome: 'AZITROMICINA',
            concentracao: '500mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido uma vez ao dia por 3 dias.'
        },
        'azitromicina-suspensao': {
            nome: 'AZITROMICINA',
            concentracao: '200mg/5mL',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 10mL uma vez ao dia por 3 dias.'
        },

        // Antifúngicos
        'miconazol-creme': {
            nome: 'MICONAZOL',
            concentracao: '2%',
            via: 'USO VAGINAL',
            apresentacao: 'tubo',
            quantidade: 1,
            unidade: 'tb',
            instrucoes: 'Aplicar uma medida vaginal à noite ao deitar-se por 7 dias.'
        },
        'nistatina-creme': {
            nome: 'NISTATINA',
            concentracao: '25.000 UI/g',
            via: 'USO VAGINAL',
            apresentacao: 'tubo',
            quantidade: 1,
            unidade: 'tb',
            instrucoes: 'Aplicar uma medida vaginal à noite ao deitar-se por 14 dias.'
        },
        'clotrimazol-creme': {
            nome: 'CLOTRIMAZOL',
            concentracao: '1%',
            via: 'USO VAGINAL',
            apresentacao: 'tubo',
            quantidade: 1,
            unidade: 'tb',
            instrucoes: 'Aplicar uma medida vaginal à noite ao deitar-se por 7 dias.'
        },

        // Suplementos
        'acido-folico': {
            nome: 'ÁCIDO FÓLICO',
            concentracao: '5mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido uma vez ao dia.'
        },
        'sulfato-ferroso': {
            nome: 'SULFATO FERROSO',
            concentracao: '40mg Fe++',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido uma vez ao dia, longe das refeições.'
        },
        'sulfato-ferroso-gotas': {
            nome: 'SULFATO FERROSO',
            concentracao: '25mg/mL Fe++',
            via: 'USO ORAL',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Tomar 40 gotas uma vez ao dia, longe das refeições.'
        },
        'vitamina-d': {
            nome: 'VITAMINA D',
            concentracao: '1.000 UI',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido uma vez ao dia.'
        },
        'vitamina-d-50000': {
            nome: 'VITAMINA D',
            concentracao: '50.000 UI',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido uma vez por semana.'
        },

        // Anti-hipertensivos
        'metildopa': {
            nome: 'METILDOPA',
            concentracao: '250mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas.'
        },
        'metildopa-500': {
            nome: 'METILDOPA',
            concentracao: '500mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas.'
        },
        'nifedipino': {
            nome: 'NIFEDIPINO',
            concentracao: '10mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas.'
        },
        'nifedipino-20': {
            nome: 'NIFEDIPINO',
            concentracao: '20mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 8/8 horas.'
        },
        'nifedipino-retard': {
            nome: 'NIFEDIPINO RETARD',
            concentracao: '20mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido de 12/12 horas.'
        },

        // Antidiabéticos
        'metformina': {
            nome: 'METFORMINA',
            concentracao: '500mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido no almoço e jantar.'
        },
        'metformina-850': {
            nome: 'METFORMINA',
            concentracao: '850mg',
            via: 'USO ORAL',
            apresentacao: 'comprimido',
            quantidade: 1,
            unidade: 'cx',
            instrucoes: 'Tomar 01 comprimido no almoço e jantar.'
        },
        'insulina-nph': {
            nome: 'INSULINA NPH',
            concentracao: '100UI/mL',
            via: 'USO SUBCUTÂNEO',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Aplicar conforme esquema prescrito.'
        },
        'insulina-regular': {
            nome: 'INSULINA REGULAR',
            concentracao: '100UI/mL',
            via: 'USO SUBCUTÂNEO',
            apresentacao: 'frasco',
            quantidade: 1,
            unidade: 'fr',
            instrucoes: 'Aplicar conforme esquema prescrito.'
        }
    },

    // Definições de padrões de prescrição
    padroesPrescricao: {
        'infeccao-urinaria': [
            {
                medicacao: 'cefalexina',
                ajustes: {
                    instrucoes: 'Tomar 01 cápsula de 6/6 horas por 7 dias.'
                }
            }
        ],
        'nauseas': [
            {
                medicacao: 'metoclopramida',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido de 8/8 horas se náusea ou vômito.'
                }
            },
            {
                medicacao: 'ondansetrona',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido de 8/8 horas se náusea persistente.'
                }
            }
        ],
        'anemia': [
            {
                medicacao: 'sulfato-ferroso',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido uma vez ao dia, longe das refeições.'
                }
            },
            {
                medicacao: 'acido-folico',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido uma vez ao dia.'
                }
            }
        ],
        'dor': [
            {
                medicacao: 'paracetamol',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido de 6/6 horas se dor ou febre. Máximo de 4 comprimidos por dia.'
                }
            },
            {
                medicacao: 'dipirona',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido de 6/6 horas se dor ou febre persistente.'
                }
            }
        ],
        'pre-natal': [
            {
                medicacao: 'acido-folico',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido uma vez ao dia.'
                }
            },
            {
                medicacao: 'sulfato-ferroso',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido uma vez ao dia, longe das refeições.'
                }
            }
        ],
        'hipertensao': [
            {
                medicacao: 'metildopa',
                ajustes: {
                    instrucoes: 'Tomar 01 comprimido de 8/8 horas.'
                }
            }
        ]
    },

    adicionarMedicacao: () => {
        const container = document.getElementById('medicacoes-list');
        const template = container.querySelector('.medicacao-item');
        const novoItem = template.cloneNode(true);
        
        // Limpa os valores
        novoItem.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.type === 'checkbox') {
                el.checked = false;
            } else {
                el.value = el.type === 'number' ? '1' : '';
            }
        });
        
        container.appendChild(novoItem);
    },

    adicionarMedicacaoPadrao: () => {
        const select = document.getElementById('medicacao-padrao');
        const medicacaoId = select.value;
        const medicacao = prescricao.medicacoesPadrao[medicacaoId];

        if (!medicacao) return;

        const container = document.getElementById('medicacoes-list');
        const template = container.querySelector('.medicacao-item');
        const novoItem = template.cloneNode(true);

        // Preenche os valores
        novoItem.querySelector('.med-checkbox').checked = true;
        novoItem.querySelector('.via-administracao').value = medicacao.via;
        novoItem.querySelector('.med-nome').value = medicacao.nome;
        novoItem.querySelector('.med-concentracao').value = medicacao.concentracao;
        novoItem.querySelector('.med-apresentacao').value = medicacao.apresentacao;
        novoItem.querySelector('.med-quantidade').value = medicacao.quantidade;
        novoItem.querySelector('.med-unidade').value = medicacao.unidade;
        novoItem.querySelector('.med-instrucoes').value = medicacao.instrucoes;

        container.appendChild(novoItem);
    },

    aplicarPadrao: (padrao) => {
        const medicacoes = prescricao.padroesPrescricao[padrao];
        if (!medicacoes) return;

        medicacoes.forEach(item => {
            const medicacao = prescricao.medicacoesPadrao[item.medicacao];
            if (!medicacao) return;

            const container = document.getElementById('medicacoes-list');
            const template = container.querySelector('.medicacao-item');
            const novoItem = template.cloneNode(true);

            // Preenche os valores base
            novoItem.querySelector('.med-checkbox').checked = true;
            novoItem.querySelector('.via-administracao').value = medicacao.via;
            novoItem.querySelector('.med-nome').value = medicacao.nome;
            novoItem.querySelector('.med-concentracao').value = medicacao.concentracao;
            novoItem.querySelector('.med-apresentacao').value = medicacao.apresentacao;
            novoItem.querySelector('.med-quantidade').value = medicacao.quantidade;
            novoItem.querySelector('.med-unidade').value = medicacao.unidade;

            // Aplica ajustes específicos do padrão
            if (item.ajustes) {
                Object.entries(item.ajustes).forEach(([campo, valor]) => {
                    const elemento = novoItem.querySelector(`.med-${campo}`);
                    if (elemento) elemento.value = valor;
                });
            } else {
                novoItem.querySelector('.med-instrucoes').value = medicacao.instrucoes;
            }

            container.appendChild(novoItem);
        });
    },

    visualizarPrescricao: () => {
        const preview = document.getElementById('prescricaoPreview');
        const conteudo = prescricao.gerarConteudoPrescricao();
        preview.innerHTML = `<pre>${conteudo}</pre>`;
        preview.style.display = 'block';
    },

    gerarConteudoPrescricao: () => {
        const paciente = document.getElementById('paciente-prescricao').value.toUpperCase();
        const local = document.getElementById('local-prescricao').value;
        const data = document.getElementById('data-prescricao').value;
        const dataFormatada = formatarData(data);
        
        let texto = `                          RECEITUÁRIO MÉDICO\n\n`;
        texto += `NOME: ${paciente}\n\n`;

        // Agrupa medicações por via de administração
        const medicacoesPorVia = {};
        
        document.querySelectorAll('.medicacao-item').forEach(item => {
            const checkbox = item.querySelector('.med-checkbox');
            if (!checkbox.checked) return;

            const via = item.querySelector('.via-administracao').value;
            const nome = item.querySelector('.med-nome').value.toUpperCase();
            const concentracao = item.querySelector('.med-concentracao').value;
            const quantidade = item.querySelector('.med-quantidade').value;
            const unidade = item.querySelector('.med-unidade').value;
            const instrucoes = item.querySelector('.med-instrucoes').value.toUpperCase();

            if (!medicacoesPorVia[via]) {
                medicacoesPorVia[via] = [];
            }

            medicacoesPorVia[via].push({
                nome,
                concentracao,
                quantidade,
                unidade,
                instrucoes
            });
        });

        // Gera o texto para cada via de administração
        Object.entries(medicacoesPorVia).forEach(([via, medicacoes]) => {
            texto += `\n                               ${via}\n\n`;
            medicacoes.forEach(med => {
                texto += `${med.nome} (${med.concentracao}) --------- ${med.quantidade} ${med.unidade}\n`;
                texto += `${med.instrucoes}\n\n`;
            });
        });

        texto += `\n${local}, ${dataFormatada}\n\n`;
        texto += `_______________________________\n`;
        texto += `Assinatura e Carimbo`;

        return texto;
    },

    gerarPrescricao: () => {
        const conteudo = prescricao.gerarConteudoPrescricao();
        
        try {
            // Cria o PDF
            const doc = new jsPDF();
            
            // Configura a fonte com tamanho menor
            doc.setFont('helvetica');
            doc.setFontSize(10); // Reduzido de 12 para 10
            
            // Define margens e largura útil
            const margemEsquerda = 20;
            const margemDireita = 20;
            const larguraUtil = doc.internal.pageSize.width - margemEsquerda - margemDireita;
            
            // Adiciona o conteúdo
            const linhas = conteudo.split('\n');
            let y = 20;
            
            linhas.forEach(linha => {
                if (y > 270) { // Se próximo do fim da página
                    doc.addPage();
                    y = 20;
                }
                
                if (linha.trim()) {
                    // Verifica se é um título de via de administração ou título principal
                    if (linha.includes('USO') || linha.includes('RECEITUÁRIO MÉDICO')) {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(12); // Mantém títulos em tamanho 12
                        // Centraliza o texto
                        const larguraTexto = doc.getStringUnitWidth(linha.trim()) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                        const xCentralizado = (doc.internal.pageSize.width - larguraTexto) / 2;
                        doc.text(linha.trim(), xCentralizado, y);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10); // Volta para tamanho 10
                    } else if (linha.includes('NOME:')) {
                        // Títulos principais
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(11); // Nome do paciente em tamanho 11
                        doc.text(linha, margemEsquerda, y);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10); // Volta para tamanho 10
                    } else if (linha.includes('-----')) {
                        // Linhas com medicação e quantidade
                        const [medicacao, quantidade] = linha.split('-----');
                        const medicacaoFormatada = medicacao.trim();
                        const quantidadeFormatada = quantidade.trim();
                        
                        // Calcula posição da quantidade para alinhar à direita
                        const larguraMedicacao = doc.getStringUnitWidth(medicacaoFormatada) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                        if (larguraMedicacao > larguraUtil - 40) { // Se o nome da medicação for muito longo
                            doc.text(medicacaoFormatada, margemEsquerda, y);
                            y += 6; // Reduzido o espaçamento de 7 para 6
                            doc.text(quantidadeFormatada, margemEsquerda, y);
                        } else {
                            doc.text(medicacaoFormatada, margemEsquerda, y);
                            doc.text(quantidadeFormatada, doc.internal.pageSize.width - margemDireita - doc.getStringUnitWidth(quantidadeFormatada) * doc.internal.getFontSize() / doc.internal.scaleFactor, y);
                        }
                    } else {
                        // Instruções e outros textos
                        const palavras = linha.split(' ');
                        let linhaAtual = '';
                        
                        for (let palavra of palavras) {
                            const linhaTest = linhaAtual + (linhaAtual ? ' ' : '') + palavra;
                            const larguraLinha = doc.getStringUnitWidth(linhaTest) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                            
                            if (larguraLinha > larguraUtil) {
                                doc.text(linhaAtual, margemEsquerda, y);
                                y += 6; // Reduzido o espaçamento de 7 para 6
                                linhaAtual = palavra;
                            } else {
                                linhaAtual = linhaTest;
                            }
                        }
                        
                        if (linhaAtual) {
                            doc.text(linhaAtual, margemEsquerda, y);
                        }
                    }
                }
                y += 6; // Reduzido o espaçamento de 7 para 6
            });
            
            // Salva o PDF
            doc.save('receituario.pdf'); // Alterado nome do arquivo
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('ObsTools - Aplicação iniciada');
    
    // Inicializa protocolos
    protocolos.init();
    
    // Adicionar listeners para tecla Enter nos inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const calcSection = input.closest('.calculadora');
                if (calcSection) {
                    calcSection.querySelector('button').click();
                }
            }
        });
    });

    // Listener para mostrar/esconder campo de título VDRL
    const trSifilisSelect = document.getElementById('trSifilis');
    const vdrlTituloDiv = document.getElementById('vdrlTitulo');
    
    if (trSifilisSelect && vdrlTituloDiv) {
        trSifilisSelect.addEventListener('change', (e) => {
            vdrlTituloDiv.style.display = e.target.value === 'VDRL' ? 'block' : 'none';
            if (e.target.value !== 'VDRL') {
                document.getElementById('vdrlValor').value = '';
            }
        });
    }

    // Adicionar listeners para cálculo de percentil em USG
    document.querySelectorAll('.usg-peso').forEach(input => {
        input.addEventListener('change', (e) => {
            geradores.calcularPercentil(e.target);
        });
    });

    // Adicionar listener para mostrar/esconder seção Doppler em USGs existentes
    document.querySelectorAll('.usg-tipo').forEach(select => {
        const dopplerSection = select.closest('.exame-usg-grupo').querySelector('.doppler-section');
        select.addEventListener('change', () => {
            dopplerSection.style.display = select.value.includes('DOPPLER') ? 'block' : 'none';
        });
    });
}); 
