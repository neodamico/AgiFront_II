import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ContasPorTipoChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/dashboard/contas-por-tipo');
                const data = await response.json();

                setChartData({
                    labels: data.map(item => item.tipoConta),
                    datasets: [{
                        data: data.map(item => item.quantidade),
                        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(255,232,86,0.8)', 'rgba(148,255,86,0.8)'],
                        borderColor: '#ffffff',
                        borderWidth: 2,
                    }],
                });
            } catch (error) {
                console.error("Erro no gráfico de pizza:", error);
            }
        };
        fetchData();
    }, []);

    const options = {
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Distribuição de Contas por Tipo' },
            datalabels: {
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = (value / total * 100).toFixed(1) + '%';
                    return percentage;
                },
                color: '#fff',
                font: { weight: 'bold', size: 14 },
            },
        },
    };

    return (
        <div style={{ width: '400px', margin: '20px auto' }}>
            {chartData ? <Pie data={chartData} options={options} /> : <p>Carregando gráfico...</p>}
        </div>
    );
};

export default ContasPorTipoChart;