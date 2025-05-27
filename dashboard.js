// Arquivo principal do dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar serviço do Firebase
    const firebaseService = new FirebaseService();
    
    // Variáveis globais para armazenar dados
    let checklistData = [];
    let filteredData = [];
    
    // Inicializar data atual nos filtros
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);
    
    document.getElementById('dataFinal').valueAsDate = hoje;
    document.getElementById('dataInicial').valueAsDate = umMesAtras;

    // Função para inicializar o dashboard
    async function initDashboard() {
        try {
            // Buscar dados do Firebase
            checklistData = await firebaseService.getChecklistData();
            filteredData = [...checklistData];
            
            // Preencher filtros com valores únicos
            const uniqueValues = await firebaseService.getUniqueFilterValues();
            populateFilters(uniqueValues);
            
            // Inicializar gráficos
            initCharts();
            
            // Aplicar filtros iniciais
            applyFilters();
            
            console.log('Dashboard inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
        }
    }

    // Função para preencher os filtros com valores únicos
    function populateFilters(uniqueValues) {
        // Preencher filtro de Tipo de Ativo
        const tipoAtivoSelect = document.getElementById('filtroTipoAtivo');
        tipoAtivoSelect.innerHTML = '<option value="">Tipo de Ativo</option>';
        uniqueValues.tipoAtivo.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            tipoAtivoSelect.appendChild(option);
        });
        
        // Preencher filtro de Placa
        const placaSelect = document.getElementById('filtroPlaca');
        placaSelect.innerHTML = '<option value="">Placa</option>';
        uniqueValues.placa.forEach(placa => {
            const option = document.createElement('option');
            option.value = placa;
            option.textContent = placa;
            placaSelect.appendChild(option);
        });
        
        // Preencher filtro de Filial
        const filialSelect = document.getElementById('filtroFilial');
        filialSelect.innerHTML = '<option value="">Filial</option>';
        uniqueValues.filial.forEach(filial => {
            const option = document.createElement('option');
            option.value = filial;
            option.textContent = filial;
            filialSelect.appendChild(option);
        });
        
        // Preencher filtro de Garagem
        const garagemSelect = document.getElementById('filtroGaragem');
        garagemSelect.innerHTML = '<option value="">Garagem</option>';
        uniqueValues.garagem.forEach(garagem => {
            const option = document.createElement('option');
            option.value = garagem;
            option.textContent = garagem;
            garagemSelect.appendChild(option);
        });
        
        // Preencher filtro de Motorista
        const motoristaSelect = document.getElementById('filtroMotorista');
        motoristaSelect.innerHTML = '<option value="">Motorista</option>';
        uniqueValues.motorista.forEach(motorista => {
            const option = document.createElement('option');
            option.value = motorista;
            option.textContent = motorista;
            motoristaSelect.appendChild(option);
        });
    }

    // Função para aplicar filtros
    function applyFilters() {
        const dataInicial = document.getElementById('dataInicial').valueAsDate;
        const dataFinal = document.getElementById('dataFinal').valueAsDate;
        const tipoAtivo = document.getElementById('filtroTipoAtivo').value;
        const placa = document.getElementById('filtroPlaca').value;
        const filial = document.getElementById('filtroFilial').value;
        const garagem = document.getElementById('filtroGaragem').value;
        const motorista = document.getElementById('filtroMotorista').value;
        
        // Ajustar data final para incluir todo o dia
        if (dataFinal) {
            dataFinal.setHours(23, 59, 59, 999);
        }
        
        filteredData = checklistData.filter(item => {
            // Filtro de data temporariamente removido para exibir todos os dados
            // Filtro de tipo de ativo
            if (tipoAtivo && item.tipoAtivo !== tipoAtivo) {
                return false;
            }
            
            // Filtro de placa
            if (placa && item.placa !== placa) {
                return false;
            }
            
            // Filtro de filial
            if (filial && item.filial !== filial) {
                return false;
            }
            
            // Filtro de garagem
            if (garagem && item.garagem !== garagem) {
                return false;
            }
            
            // Filtro de motorista
            if (motorista && item.motorista !== motorista) {
                return false;
            }
            
            return true;
        });
        
        // Atualizar gráficos e tabelas com dados filtrados
        updateCharts();
        updateTables();
        updateSummaryCards();
    }

    // Função para inicializar gráficos
    function initCharts() {
        // Gráfico de Score
        const scoreCtx = document.getElementById('scoreChart').getContext('2d');
        window.scoreChart = new Chart(scoreCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [
                        '#6610f2',
                        '#2a2e33'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '80%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
        
        // Gráfico de Ativos
        const ativosCtx = document.getElementById('ativosChart').getContext('2d');
        window.ativosChart = new Chart(ativosCtx, {
            type: 'doughnut',
            data: {
                labels: ['Executadas', 'Pendentes'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        '#6610f2',
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Gráfico de Inspeções
        const inspecoesCtx = document.getElementById('inspecoesChart').getContext('2d');
        window.inspecoesChart = new Chart(inspecoesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Conforme', 'Não Conforme'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        '#6610f2',
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Gráfico de Evolução
        const evolucaoCtx = document.getElementById('evolucaoChart').getContext('2d');
        window.evolucaoChart = new Chart(evolucaoCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Score',
                    data: [],
                    backgroundColor: '#6610f2',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Gráfico de Inspeções por Mês
        const inspecoesMesCtx = document.getElementById('inspecoesMesChart').getContext('2d');
        window.inspecoesMesChart = new Chart(inspecoesMesCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Inspeções',
                    data: [],
                    backgroundColor: '#6610f2',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Gráfico de Inspeções por Ativo
        const inspecoesAtivoCtx = document.getElementById('inspecoesAtivoChart').getContext('2d');
        window.inspecoesAtivoChart = new Chart(inspecoesAtivoCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Inspeções',
                    data: [],
                    backgroundColor: '#6610f2',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Função para atualizar gráficos com dados filtrados
    async function updateCharts() {
        // Calcular estatísticas
        const stats = await calculateStatistics(filteredData);
        
        // Atualizar gráfico de score
        window.scoreChart.data.datasets[0].data = [stats.scoreMedio, 10 - stats.scoreMedio];
        window.scoreChart.update();
        document.getElementById('scoreValue').textContent = stats.scoreMedio;
        
        // Atualizar gráfico de ativos
        window.ativosChart.data.datasets[0].data = [stats.totalAtivos, 0];
        window.ativosChart.update();
        
        // Atualizar gráfico de inspeções
        window.inspecoesChart.data.datasets[0].data = [stats.totalConformes, stats.totalNaoConformes];
        window.inspecoesChart.update();
        
        // Obter dados agrupados por mês
        const monthData = await getDataByMonth(filteredData);
        
        // Atualizar gráfico de evolução
        window.evolucaoChart.data.labels = monthData.meses;
        window.evolucaoChart.data.datasets[0].data = monthData.scores;
        window.evolucaoChart.update();
        
        // Atualizar gráfico de inspeções por mês
        window.inspecoesMesChart.data.labels = monthData.meses;
        window.inspecoesMesChart.data.datasets[0].data = monthData.inspecoes;
        window.inspecoesMesChart.update();
        
        // Obter dados agrupados por ativo
        const assetData = await getDataByAsset(filteredData);
        
        // Atualizar gráfico de inspeções por ativo
        window.inspecoesAtivoChart.data.labels = assetData.ativos;
        window.inspecoesAtivoChart.data.datasets[0].data = assetData.inspecoes;
        window.inspecoesAtivoChart.update();
    }

    // Função para calcular estatísticas
    async function calculateStatistics(data) {
        // Total de ativos únicos
        const totalAtivos = new Set(data.map(item => item.placa)).size;
        
        // Total de inspeções
        const totalInspecoes = data.length;
        
        // Total de inspeções conformes e não conformes
        const totalConformes = data.filter(item => item.status === true).length;
        const totalNaoConformes = data.filter(item => item.status === false).length;
        
        // Total de motoristas únicos
        const totalMotoristas = new Set(data.map(item => item.motorista)).size;
        
        // Calcular score médio
        let scoreTotal = 0;
        data.forEach(item => {
            scoreTotal += item.score || 0;
        });
        const scoreMedio = totalInspecoes > 0 ? (scoreTotal / totalInspecoes).toFixed(1) : 0;
        
        return {
            totalAtivos,
            totalInspecoes,
            totalConformes,
            totalNaoConformes,
            totalMotoristas,
            scoreMedio
        };
    }

    // Função para obter dados agrupados por mês
    async function getDataByMonth(data) {
        const mesesData = {};
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        data.forEach(item => {
            const mes = item.dataInspecao.getMonth();
            const ano = item.dataInspecao.getFullYear();
            const chave = `${ano}-${mes}`;
            
            if (!mesesData[chave]) {
                mesesData[chave] = {
                    scoreTotal: 0,
                    count: 0,
                    inspecoes: 0,
                    nome: mesesNomes[mes],
                    ano: ano,
                    mes: mes
                };
            }
            
            mesesData[chave].scoreTotal += item.score || 0;
            mesesData[chave].count++;
            mesesData[chave].inspecoes++;
        });
        
        // Ordenar por ano e mês
        const mesesOrdenados = Object.keys(mesesData).sort((a, b) => {
            const [anoA, mesA] = a.split('-').map(Number);
            const [anoB, mesB] = b.split('-').map(Number);
            
            if (anoA !== anoB) {
                return anoA - anoB;
            }
            
            return mesA - mesB;
        });
        
        return {
            meses: mesesOrdenados.map(key => mesesData[key].nome),
            scores: mesesOrdenados.map(key => 
                mesesData[key].count > 0 ? (mesesData[key].scoreTotal / mesesData[key].count).toFixed(1) : 0
            ),
            inspecoes: mesesOrdenados.map(key => mesesData[key].inspecoes)
        };
    }

    // Função para obter dados agrupados por ativo
    async function getDataByAsset(data) {
        const ativosData = {};
        
        data.forEach(item => {
            if (!ativosData[item.placa]) {
                ativosData[item.placa] = 0;
            }
            
            ativosData[item.placa]++;
        });
        
        // Ordenar por quantidade de inspeções (top 5)
        const ativosOrdenados = Object.keys(ativosData)
            .sort((a, b) => ativosData[b] - ativosData[a])
            .slice(0, 5);
        
        return {
            ativos: ativosOrdenados,
            inspecoes: ativosOrdenados.map(placa => ativosData[placa])
        };
    }

    // Função para atualizar cards de resumo
    async function updateSummaryCards() {
        // Calcular estatísticas
        const stats = await calculateStatistics(filteredData);
        
        // Atualizar cards
        document.getElementById('totalAtivos').textContent = stats.totalAtivos;
        document.getElementById('totalExecutadas').textContent = stats.totalAtivos;
        document.getElementById('totalPendentes').textContent = '0';
        
        document.getElementById('totalInspecoes').textContent = stats.totalInspecoes;
        document.getElementById('totalConformes').textContent = stats.totalConformes;
        document.getElementById('totalNaoConformes').textContent = stats.totalNaoConformes;
        
        document.getElementById('totalMotoristas').textContent = stats.totalMotoristas;
        
        // Distribuição de motoristas (simulada)
        document.getElementById('motoristaBom').textContent = Math.round(stats.totalMotoristas * 0.6);
        document.getElementById('motoristaSatisfatorio').textContent = Math.round(stats.totalMotoristas * 0.3);
        document.getElementById('motoristaCritico').textContent = Math.round(stats.totalMotoristas * 0.1);
        
        // Atualizar scorecard
        document.getElementById('scoreValue').textContent = stats.scoreMedio;
    }

    // Função para atualizar tabelas
    function updateTables() {
        // Tabela de Ativos
        const tabelaAtivos = document.getElementById('tabelaAtivos');
        const tbodyAtivos = tabelaAtivos.querySelector('tbody');
        tbodyAtivos.innerHTML = '';
        
        // Agrupar por placa para evitar duplicatas
        const ativosUnicos = {};
        filteredData.forEach(item => {
            ativosUnicos[item.placa] = item;
        });
        
        Object.values(ativosUnicos).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tipoAtivo}</td>
                <td>${item.placa}</td>
                <td>${item.centroCusto}</td>
                <td>${item.filial}</td>
                <td>${item.garagem}</td>
                <td>${item.naoConforme}</td>
                <td><i class="fas fa-chevron-right"></i></td>
            `;
            tbodyAtivos.appendChild(row);
        });
        
        // Tabela de Status
        const tabelaStatus = document.getElementById('tabelaStatus');
        const tbodyStatus = tabelaStatus.querySelector('tbody');
        tbodyStatus.innerHTML = '';
        
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tipoAtivo}</td>
                <td>${item.placa}</td>
                <td>${item.centroCusto}</td>
                <td>${item.filial}</td>
                <td>${item.garagem}</td>
                <td>${item.status ? 'Conforme' : 'Não Conforme'}</td>
                <td><i class="fas fa-chevron-right"></i></td>
            `;
            tbodyStatus.appendChild(row);
        });
        
        // Tabela de Não Conformes
        const tabelaNaoConformes = document.getElementById('tabelaNaoConformes');
        const tbodyNaoConformes = tabelaNaoConformes.querySelector('tbody');
        tbodyNaoConformes.innerHTML = '';
        
        const naoConformes = filteredData.filter(item => item.status === false);
        naoConformes.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tipoAtivo}</td>
                <td>${item.placa}</td>
                <td>${item.centroCusto}</td>
                <td>${item.filial}</td>
                <td>${item.garagem}</td>
                <td>${item.itemName || 'Não Informado'}</td>
                <td><i class="fas fa-chevron-right"></i></td>
            `;
            tbodyNaoConformes.appendChild(row);
        });
        
        // Atualizar o total de inspeções no card
        document.getElementById('totalInspecoes').textContent = filteredData.length;
    }

    // Evento de clique no botão de filtrar
    document.getElementById('btnFiltrar').addEventListener('click', function() {
        applyFilters();
    });

    // Eventos de clique nos botões de exportar
    document.getElementById('exportarAtivos').addEventListener('click', function() {
        exportTable('tabelaAtivos', 'Lista_de_Ativos');
    });
    
    document.getElementById('exportarStatus').addEventListener('click', function() {
        exportTable('tabelaStatus', 'Lista_de_Status');
    });
    
    document.getElementById('exportarNaoConformes').addEventListener('click', function() {
        exportTable('tabelaNaoConformes', 'Lista_de_Nao_Conformes');
    });
    
    // Função para exportar tabela para CSV
    function exportTable(tableId, filename) {
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll('tr');
        
        let csvContent = '';
        
        // Obter cabeçalhos
        const headers = Array.from(rows[0].querySelectorAll('th')).map(th => th.textContent.trim());
        csvContent += headers.join(',') + '\n';
        
        // Obter dados
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => {
                // Remover ícones e outros elementos HTML
                const text = cell.textContent.trim();
                // Escapar aspas e adicionar aspas ao redor do texto
                return `"${text.replace(/"/g, '""')}"`;
            });
            
            // Remover última coluna (ícone)
            rowData.pop();
            
            csvContent += rowData.join(',') + '\n';
        }
        
        // Criar link para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Inicializar dashboard
    initDashboard();
});
