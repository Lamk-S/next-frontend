'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { getCambioEstados, createCambioEstado, updateCambioEstado, deleteCambioEstado} from '@/app/api/cambioEstadoApi'; // Ajusta el path según tu estructura
import { getActivos, Activo } from '@/app/api/activoApi'; // Ajusta el path según tu estructura
import { Dropdown } from 'primereact/dropdown';

const CambioEstadoPage = () => {
    
    interface CambioEstado1 {
        id: number;
        activo: Activo; // ID del Activo relacionado
        descripcion: string;
        estado_anterior: string;
        estado_nuevo: string;
        fecha_cambio: string; // ISO formato de fecha
        razon: string; // Opcional
    }

    interface CambioEstado {
        id: number;
        activo_id: number; // ID del Activo relacionado
        descripcion: string;
        estado_anterior: string;
        estado_nuevo: string;
        fecha_cambio: string; // ISO formato de fecha
        razon: string; // Opcional
    }

    const emptyCambioEstado = {
        id: 0,
        activo_id: 0, // Asume que este será un ID de `Activo`.
        descripcion: '',
        estado_anterior: '',
        estado_nuevo: '',
        fecha_cambio: new Date().toISOString(),
        razon: '',
    };

    const [cambioEstados, setCambioEstados] = useState<CambioEstado1[]>([]);
    const [activos, setActivos] = useState([]);
    const [cambioEstadoDialog, setCambioEstadoDialog] = useState(false);
    const [deleteCambioEstadoDialog, setDeleteCambioEstadoDialog] = useState(false);
    const [cambioEstado, setCambioEstado] = useState<CambioEstado>(emptyCambioEstado);
    const [selectedCambioEstados, setSelectedCambioEstados] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchCambioEstados();
        fetchAuxiliaryData();
    }, []);

    const fetchCambioEstados = async () => {
        try {
            const response = await getCambioEstados();
            setCambioEstados(response.data.results);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load data.' });
        }
    };

    const fetchAuxiliaryData = async () => {
        try {
            const [activosRes] = await Promise.all([getActivos()]);
            setActivos(activosRes.data.results); // Ajusta según la estructura de respuesta
        } catch (error) {
            console.error('Error fetching auxiliary data:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Could not load auxiliary data.',
            });
        }
    };

    const openNew = () => {
        setCambioEstado(emptyCambioEstado);
        setSubmitted(false);
        setCambioEstadoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCambioEstadoDialog(false);
    };

    const saveCambioEstado = async () => {
        setSubmitted(true);

        if (cambioEstado.descripcion.trim() && cambioEstado.estado_anterior.trim() && cambioEstado.estado_nuevo.trim()) {
            try {
                let updatedCambioEstados;
                if (cambioEstado.id) {
                    const response = await updateCambioEstado(cambioEstado.id, cambioEstado);
                    updatedCambioEstados = cambioEstados.map((ce) => (ce.id === response.data.id ? response.data : ce));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Cambio Estado Updated', life: 3000 });
                } else {
                    const response = await createCambioEstado(cambioEstado);
                    updatedCambioEstados = [...cambioEstados, response.data];
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Cambio Estado Created', life: 3000 });
                }
                setCambioEstados(updatedCambioEstados);
                setCambioEstadoDialog(false);
                setCambioEstado(emptyCambioEstado);
            } catch (error) {
                console.error("Error saving data:", error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not save data.' });
            }
        }
    };

    const editCambioEstado = (cambioEstado: CambioEstado) => {
        setCambioEstado({ ...cambioEstado });
        setCambioEstadoDialog(true);
    };

    const confirmDeleteCambioEstado = (cambioEstado: CambioEstado) => {
        setCambioEstado(cambioEstado);
        setDeleteCambioEstadoDialog(true);
    };

    const deleteCambioEstadoConfirmed = async () => {
        try {
            await deleteCambioEstado(cambioEstado.id);
            setCambioEstados(cambioEstados.filter((ce) => ce.id !== cambioEstado.id));
            setDeleteCambioEstadoDialog(false);
            setCambioEstado(emptyCambioEstado);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Cambio Estado Deleted', life: 3000 });
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete data.' });
        }
    };

    const onInputChange = (e: any, name: string) => {
        const val = (e.target && e.target.value) || '';
        setCambioEstado({ ...cambioEstado, [name]: val });
    };


    const onDropdownChange = (e: { value: any }, name: string) => {
        setCambioEstado({ ...cambioEstado, [name]: e.value });
    };

    const leftToolbarTemplate = () => (
        <>
            <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
        </>
    );

    const cambioEstadoDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveCambioEstado} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <DataTable
                        value={cambioEstados}
                        dataKey="id"
                        paginator
                        rows={10}
                        emptyMessage="No data found."
                        responsiveLayout="scroll"
                    >
                        <Column field="activo" header="Activo" sortable></Column>
                        <Column field="descripcion" header="Descripción" sortable></Column>
                        <Column field="estado_anterior" header="Estado Anterior" sortable></Column>
                        <Column field="estado_nuevo" header="Estado Nuevo" sortable></Column>
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <>
                                    <Button icon="pi pi-pencil" severity="success" onClick={() => editCambioEstado(rowData)} />
                                    <Button icon="pi pi-trash" severity="danger" onClick={() => confirmDeleteCambioEstado(rowData)} />
                                </>
                            )}
                        ></Column>
                    </DataTable>

                    <Dialog visible={cambioEstadoDialog} style={{ width: '450px' }} header="Cambio Estado Details" modal footer={cambioEstadoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText id="descripcion" value={cambioEstado.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="estado_anterior">Estado Anterior</label>
                            <InputText id="estado_anterior" value={cambioEstado.estado_anterior} onChange={(e) => onInputChange(e, 'estado_anterior')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="estado_nuevo">Estado Nuevo</label>
                            <InputText id="estado_nuevo" value={cambioEstado.estado_nuevo} onChange={(e) => onInputChange(e, 'estado_nuevo')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="razon">Razón</label>
                            <InputText id="razon" value={cambioEstado.razon} onChange={(e) => onInputChange(e, 'razon')} />
                        </div>
                        <div className="field">
                            <label htmlFor="activo">Activo</label>
                            <Dropdown
                                id="activo"
                                value={cambioEstado.activo_id}
                                options={activos}
                                onChange={(e) => onDropdownChange(e, 'activo_id')}
                                optionLabel="codigo"
                                placeholder="Select Activo"
                                optionValue="id" // El valor del Dropdown será el ID del departamento
                            />
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CambioEstadoPage;