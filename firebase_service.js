// Serviço para interação com o Firebase
class FirebaseService {
    constructor() {
        // Configuração do Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDummyKeyForDevelopment",
            authDomain: "sentinel-insights-o7f49d.firebaseapp.com",
            projectId: "sentinel-insights-o7f49d",
            storageBucket: "sentinel-insights-o7f49d.appspot.com",
            messagingSenderId: "123456789012",
            appId: "1:123456789012:web:abcdef1234567890abcdef"
        };

        // Inicialização do Firebase
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        
        // Configurar CORS para permitir acesso do GitHub Pages
        this.db.settings({
            ignoreUndefinedProperties: true
        });
        
        this.enterpriseId = "qzDVZ1jB6IC60baxtsDU"; // ID da empresa para testes
    }

    // Método para obter dados da collection Checklist
    async getChecklistData() {
        try {
            console.log('Buscando dados com enterpriseId:', this.enterpriseId);
            const snapshot = await this.db.collection('Checklist')
                .where('enterpriseId', '==', this.enterpriseId)
                .get();
            
            if (snapshot.empty) {
                console.log('Nenhum documento encontrado');
                return [];
            }
            
            // Mapear documentos para array
            const data = snapshot.docs.map(doc => {
                const docData = doc.data();
                return { 
                    id: doc.id, 
                    ...docData,
                    // Mapeamento de campos para facilitar o acesso
                    tipoAtivo: docData.planName || 'Não Informado',
                    placa: docData.vehiclePlate || 'Não Informado',
                    centroCusto: 'Não Informado', // Campo não encontrado no documento
                    filial: 'Não Informado', // Campo não encontrado no documento
                    garagem: 'Não Informado', // Campo não encontrado no documento
                    motorista: docData.driverName || 'Não Informado',
                    status: docData.compliant || false,
                    naoConforme: docData.noCompliant ? 'Sim' : 'Não',
                    itemName: docData.itemName || 'Não Informado',
                    dataInspecao: docData.timestamp ? new Date(docData.timestamp.seconds * 1000) : new Date(),
                    score: docData.score || 0
                };
            });
            
            console.log(`Encontrados ${data.length} documentos`);
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            return [];
        }
    }

    // Método para obter valores únicos para filtros
    async getUniqueFilterValues() {
        try {
            const data = await this.getChecklistData();
            
            const uniqueValues = {
                tipoAtivo: new Set(),
                placa: new Set(),
                centroCusto: new Set(),
                filial: new Set(),
                garagem: new Set(),
                motorista: new Set()
            };
            
            data.forEach(item => {
                if (item.tipoAtivo) uniqueValues.tipoAtivo.add(item.tipoAtivo);
                if (item.placa) uniqueValues.placa.add(item.placa);
                if (item.centroCusto) uniqueValues.centroCusto.add(item.centroCusto);
                if (item.filial) uniqueValues.filial.add(item.filial);
                if (item.garagem) uniqueValues.garagem.add(item.garagem);
                if (item.motorista) uniqueValues.motorista.add(item.motorista);
            });
            
            // Converter Sets para Arrays
            return {
                tipoAtivo: Array.from(uniqueValues.tipoAtivo),
                placa: Array.from(uniqueValues.placa),
                centroCusto: Array.from(uniqueValues.centroCusto),
                filial: Array.from(uniqueValues.filial),
                garagem: Array.from(uniqueValues.garagem),
                motorista: Array.from(uniqueValues.motorista)
            };
        } catch (error) {
            console.error('Erro ao obter valores únicos:', error);
            return {
                tipoAtivo: [],
                placa: [],
                centroCusto: [],
                filial: [],
                garagem: [],
                motorista: []
            };
        }
    }

    // Método para calcular estatísticas
    async getStatistics() {
        try {
            const data = await this.getChecklistData();
            
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
        } catch (error) {
            console.error('Erro ao calcular estatísticas:', error);
            return {
                totalAtivos: 0,
                totalInspecoes: 0,
                totalConformes: 0,
                totalNaoConformes: 0,
                totalMotoristas: 0,
                scoreMedio: 0
            };
        }
    }

    // Método para obter dados agrupados por mês
    async getDataByMonth() {
        try {
            const data = await this.getChecklistData();
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
        } catch (error) {
            console.error('Erro ao obter dados por mês:', error);
            return {
                meses: [],
                scores: [],
                inspecoes: []
            };
        }
    }

    // Método para obter dados agrupados por ativo
    async getDataByAsset(data) {
        try {
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
        } catch (error) {
            console.error('Erro ao obter dados por ativo:', error);
            return {
                ativos: [],
                inspecoes: []
            };
        }
    }
}
