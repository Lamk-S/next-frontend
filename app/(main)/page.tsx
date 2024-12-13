/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getResumen, ResumenData } from '@/app/api/recursosApi';
import useAuth from '../hooks/useAuth';
import { TooltipItem } from 'chart.js';

const Dashboard: React.FC = () => {
    const authToken = useAuth();
    const [resumenData, setResumenData] = useState<ResumenData | null>(null);

    useEffect(() => {
        getResumen()
            .then(setResumenData)
            .catch((err) => {
                console.error('Error fetching resumen:', err);
            });
    }, []);

    if (!resumenData || !authToken) return <div>Loading...</div>;

    // Gráfico: Activos por Estado
    const estadoChartData = {
        labels: resumenData.activos_por_estado.map((item) => item.estado),
        datasets: [
            {
                data: resumenData.activos_por_estado.map((item) => item.total),
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#FF6384'],
                hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#FF7F84'],
            },
        ],
    };

    const estadoChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'pie'>) => `${context.label}: ${context.raw}`,
                },
            },
        },
    };

    const capacidadChartData = {
        labels: resumenData.capacidad_por_edificio.map((item) => item.nombre_edificio),
        datasets: [
            {
                label: 'Capacidad Total',
                backgroundColor: '#42A5F5',
                data: resumenData.capacidad_por_edificio.map((item) => item.total_capacidad),
            },
        ],
    };

    const consumo3DOptions = {
        plugins: {
            legend: {
                position: 'top',
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };


    // Gráfico: Consumo de Recursos
    const consumoChartData = {
        labels: ['Energía', 'Agua'],
        datasets: [
            {
                label: 'Consumo Total',
                data: [resumenData.consumo_por_activo.total_energia, resumenData.consumo_por_activo.total_agua],
                backgroundColor: ['#FF6384', '#36A2EB'],
                hoverBackgroundColor: ['#FF7F84', '#64B5F6'],
            },
        ],
    };

    const consumoChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Indicadores Clave
    const indicadores = [
        {
            title: 'Total Energía',
            value: `${resumenData.consumo_por_activo.total_energia} kWh`,
            icon: 'pi pi-chart-bar',
            bg: 'bg-blue-100',
            textColor: 'text-blue-500',
        },
        {
            title: 'Total Agua',
            value: `${resumenData.consumo_por_activo.total_agua} L`,
            icon: 'pi pi-cloud',
            bg: 'bg-cyan-100',
            textColor: 'text-cyan-500',
        },
        {
            title: 'Activos Operativos',
            value: resumenData.activos_por_estado.find((item) => item.estado === 'Operativo')?.total || 0,
            icon: 'pi pi-cog',
            bg: 'bg-green-100',
            textColor: 'text-green-500',
        },
        {
            title: 'Edificios Registrados',
            value: resumenData.capacidad_por_edificio.length,
            icon: 'pi pi-building',
            bg: 'bg-purple-100',
            textColor: 'text-purple-500',
        },
    ];

    return (
        <div className="grid">
            {/* Indicadores Clave */}
            {indicadores.map((indicador, idx) => (
                <div className="col-12 sm:col-6 lg:col-3" key={idx}>
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">{indicador.title}</span>
                                <div className="text-900 font-medium text-xl">{indicador.value}</div>
                            </div>
                            <div
                                className={`flex align-items-center justify-content-center ${indicador.bg} border-round`}
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className={`${indicador.icon} ${indicador.textColor} text-xl`} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Gráfico de Activos por Estado */}
            <div className="col-12 md:col-6">
                <div className="card" style={{ height: '400px' }}>
                    <h5>Activos por Estado</h5>
                    <Chart type="pie" data={estadoChartData} options={estadoChartOptions} />
                </div>
            </div>

            {/* Gráfico de Consumo de Recursos */}
            <div className="col-12 md:col-6">
                <div className="card" style={{ height: '400px' }}>
                    <h5>Consumo de Recursos</h5>
                    <Chart type="doughnut" data={consumoChartData} options={consumoChartOptions} />
                </div>
            </div>

            {/* Gráfico de Capacidad por Edificio */}
            <div className="col-12">
                <div className="card" style={{ height: '100%' }}>
                    <h5>Capacidad por Edificio</h5>
                    <Chart height='400px' type="bar" data={capacidadChartData} options={consumo3DOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;