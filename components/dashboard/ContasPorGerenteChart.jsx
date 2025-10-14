import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const ContasPorGerenteChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/dashboard/contas-por-gerente');
                const data = await response.json();

                setChartData({
                    labels: data.map(item => item.nomeGerente),
                    datasets: [{
                        label: 'Contas Abertas',
                        data: data.map(item => item.quantidadeContas),
                        backgroundColor: 'rgba(0, 123, 255, 0.8)',
                    }],
                });
            } catch (error) {
                console.error("Erro no gráfico de barras:", error);
            }
        };
        fetchData();
    }, []);

    const options = {
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Desempenho de Contas por Gerente' },
            datalabels: {
                anchor: 'end',
                align: 'end',
                color: '#555',
                font: { weight: 'bold' },
            },
        },
        scales: { x: { beginAtZero: true } }
    };

    return (
        <div style={{ width: '800px', margin: '20px auto' }}>
            {chartData ? <Bar options={options} data={chartData} /> : <p>Carregando gráfico...</p>}
        </div>
    );
};

export default ContasPorGerenteChart;