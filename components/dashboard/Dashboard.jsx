import React from 'react';
import ContasNoMesCard from './ContasNoMesCard';
import ContasPorTipoChart from './ContasPorTipoChart';
import ContasPorGerenteChart from './ContasPorGerenteChart';

const dashboardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
    padding: '20px',
    backgroundColor: '#f4f4f7',
    width: '100%'
};

const Dashboard = () => {
    return (
        <div style={dashboardStyle}>
            {/* O card de destaque */}
            <ContasNoMesCard />

            {/* O gráfico de pizza */}
            <ContasPorTipoChart />

            {/* O gráfico de barras */}
            <ContasPorGerenteChart />
        </div>
    );
};

export default Dashboard;