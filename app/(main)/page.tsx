/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { getResumen, ResumenData } from '@/app/api/recursosApi';
import useAuth from '../hooks/useAuth';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { TooltipItem } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, Title } from 'chart.js';

// Registrar los elementos de Chart.js necesarios
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, Title, ChartDataLabels);

const Dashboard: React.FC = () => {
    const authToken = useAuth();
    const [resumenData, setResumenData] = useState<ResumenData | null>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getResumen()
            .then(setResumenData)
            .catch((err) => {
                console.error('Error fetching resumen:', err);
            });
    }, []);

    if (!resumenData || !authToken) return <div>Loading...</div>;

    // Calcular porcentajes para gráficos
    const totalActivos = resumenData.activos_por_estado.reduce((sum, item) => sum + item.total, 0);
    const totalConsumo = resumenData.consumo_por_activo.total_energia + resumenData.consumo_por_activo.total_agua;

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
                    label: (context: TooltipItem<'pie'>) => {
                        const label = context.label || '';
                        const value = context.raw as number;
                        const percentage = ((value / totalActivos) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
            datalabels: {
                color: '#ffffff',
                formatter: (value: number, context: any) => {
                    const percentage = ((value / totalActivos) * 100).toFixed(1);
                    return `${value} (${percentage}%)`;
                },
                font: {
                    weight: 'bold',
                },
            },
        },
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
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'doughnut'>) => {
                        const label = context.label || '';
                        const value = context.raw as number;
                        const percentage = ((value / totalConsumo) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
            datalabels: {
                color: '#ffffff',
                formatter: (value: number, context: any) => {
                    const percentage = ((value / totalConsumo) * 100).toFixed(1);
                    return `${value} (${percentage}%)`;
                },
                font: {
                    weight: 'bold',
                },
            },
        },
    };

    // Gráfico: Capacidad por Edificio
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

    const capacidadChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'bar'>) => {
                        const label = context.label || '';
                        const value = context.raw as number;
                        return `${label}: ${value}`;
                    },
                },
            },
            datalabels: {
                color: '#000000',
                anchor: 'end',
                align: 'top',
                formatter: (value: number, context: any) => `${value}`,
                font: {
                    weight: 'bold',
                },
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

    // Función para generar PDF
    const generatePDF = async () => {
        if (!dashboardRef.current) return;

        const pdf = new jsPDF('p', 'mm', 'a4');

        // Añadir título al PDF
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.text('Reportes de KPIs', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('Gestión de Infraestructura y Recursos', pdf.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

        // Capturar el contenido con mayor calidad (escala aumentada a 4)
        const canvas = await html2canvas(dashboardRef.current, {
            scale: 4,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
        pdf.save('dashboard_report.pdf');
    };

    return (
        <div>
            {/* Título y Botón */}
            <div className="card flex justify-content-between align-items-center mb-4 p-3">
                <h1 className="text-2xl font-bold text-center flex-grow-1">Reportes de KPIs de la Gestión de Infraestructura y Recursos</h1>
                <button
                    onClick={generatePDF}
                    className="p-button p-component p-button-rounded p-button-danger"
                    title="Generar Reporte en PDF"
                >
                    <i className="pi pi-file-pdf text-lg" />
                </button>
            </div>

            {/* Dashboard */}
            <div ref={dashboardRef} className="grid">
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
                        <Chart height="400px" type="bar" data={capacidadChartData} options={capacidadChartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;