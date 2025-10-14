import React, { useState, useEffect } from 'react';

const cardStyle = {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    textAlign: 'center',
    width: '300px',
    margin: '20px auto'
};

const ContasNoMesCard = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/dashboard/contas-mes');
                if (!response.ok) throw new Error('Falha ao buscar dados');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                setError(error.message);
                console.error("Erro no card de contas no mês:", error);
            }
        };
        fetchData();
    }, []);

    if (error) return <div style={cardStyle}><p style={{ color: 'red' }}>{error}</p></div>;
    if (!stats) return <div style={cardStyle}><p>Carregando...</p></div>;

    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, color: '#555', fontSize: '18px' }}>Contas Abertas em</h2>
            <p style={{ margin: '5px 0 10px 0', color: '#007bff', fontSize: '22px', fontWeight: 'bold' }}>
                {stats.mes.charAt(0).toUpperCase() + stats.mes.slice(1)}
            </p>
            <p style={{ margin: 0, fontSize: '48px', fontWeight: 'bold', color: '#333' }}>
                {stats.quantidade}
            </p>
        </div>
    );
};

export default ContasNoMesCard;