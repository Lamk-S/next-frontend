'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { getActivos, createActivo, updateActivo, deleteActivo, Activo } from '@/app/api/activoApi';
import { getAmbientes } from '@/app/api/ambienteApi'; // Asume que tienes una API para obtener ambientes

interface Activo1 {
    id: number;
    codigo: string;
    descripcion: string;
    marca: string;
    modelo: string;
    serie: string;
    estado: string;
    observaciones: string;
    ambiente: Ambiente | null; // ID del ambiente relacionado
}

interface Ambiente {
    id: number;
    codigo: string;
    ubicacion: string;
    capacidad: number;
    departamento_id:  number | null;
    escuela_id:  number | null;
    tipo_ambiente_id:  number | null;
}

const ActivoPage = () => {
    const emptyActivo: Activo = {
        id: 0,
        codigo: '',
        descripcion: '',
        marca: '',
        modelo: '',
        serie: '',
        estado: '',
        observaciones: '',
        ambiente_id: 0,
    };

    const [activos, setActivos] = useState<Activo1[]>([]);
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    const [activoDialog, setActivoDialog] = useState(false);
    const [deleteActivoDialog, setDeleteActivoDialog] = useState(false);
    const [activo, setActivo] = useState<Activo>(emptyActivo);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Activo1[]>>(null); // Reference for DataTable export

    useEffect(() => {
        fetchActivos();
        fetchAmbientes();
    }, []);

    const fetchActivos = async () => {
        try {
            const response = await getActivos();
            setActivos(response.data.results); // Asegúrate de que contiene un array
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load data.' });
        }
    };

    const fetchAmbientes = async () => {
        try {
            const response = await getAmbientes();
            const formattedAmbientes = response.data.results.map((ambiente: any) => ({
                ...ambiente,
                displayLabel: `${ambiente.codigo} - ${ambiente.tipo_ambiente.nombre}`, // Combina los campos
            }));
            setAmbientes(formattedAmbientes);
        } catch (error) {
            console.error('Error fetching ambientes:', error);
        }
    };

    const openNew = () => {
        setActivo(emptyActivo);
        setSubmitted(false);
        setActivoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setActivoDialog(false);
    };

    const hideDeleteActivoDialog = () => {
        setDeleteActivoDialog(false);
    };

    const saveActivo = async () => {
        setSubmitted(true);

        if (activo.codigo.trim()) {
            try {
                let updatedActivos;
                if (activo.id) {
                    const response = await updateActivo(activo.id, activo);
                    updatedActivos = activos.map((a) => (a.id === response.data.id ? response.data : a));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Activo Updated', life: 3000 });
                } else {
                    console.log(activo);
                    const response = await createActivo(activo);
                    console.log(activo);
                    updatedActivos = [...activos, response.data];
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Activo Created', life: 3000 });
                }
                setActivos(updatedActivos);
                setActivoDialog(false);
                setActivo(emptyActivo);
            } catch (error) {
                console.error('Error saving data:', error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not save data.' });
            }
        }
    };

    const transformActivo1ToActivo = (activo1: Activo1): Activo => {
        return {
            id: activo1.id,
            codigo: activo1.codigo,
            descripcion: activo1.descripcion,
            marca: activo1.marca,
            modelo: activo1.modelo,
            serie: activo1.serie,
            estado: activo1.estado,
            observaciones: activo1.observaciones,
            ambiente_id: activo1.ambiente ? activo1.ambiente.id : null, // Extraer el ID del ambiente
        };
    };

    const editActivo = (activo: Activo1) => {
        console.log(activo);
        const transformedActivo = transformActivo1ToActivo(activo);
        setActivo(transformedActivo);
        setActivoDialog(true);
    };

    const confirmDeleteActivo = (activo: Activo) => {
        setActivo(activo);
        setDeleteActivoDialog(true);
    };

    const deleteActivoConfirmed = async () => {
        try {
            await deleteActivo(activo.id!);
            setActivos(activos.filter((a) => a.id !== activo.id));
            setDeleteActivoDialog(false);
            setActivo(emptyActivo);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Activo Deleted', life: 3000 });
        } catch (error) {
            console.error('Error deleting data:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete data.' });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };


    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" /> */}
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setActivo({ ...activo, [name]: val });
    };

    const onDropdownChange = (e: { value: number }, name: string) => {
        setActivo({ ...activo, [name]: e.value });
    };

    const ambienteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveActivo} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar
                        className="mb-4"
                        right={rightToolbarTemplate}
                        left={<Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />}
                    ></Toolbar>

                    <DataTable
                        ref={dt}
                        value={activos}
                        dataKey="id"
                        paginator
                        rows={10}
                        className="datatable-responsive"
                        responsiveLayout="scroll"
                        emptyMessage="No data found."
                    >
                        <Column field="codigo" header="Código" sortable></Column>
                        <Column field="descripcion" header="Descripción" sortable></Column>
                        <Column field="marca" header="Marca" sortable></Column>
                        <Column field="modelo" header="Modelo" sortable></Column>
                        <Column field="serie" header="Serie" sortable></Column>
                        <Column field="estado" header="Estado" sortable></Column>
                        <Column field="observaciones" header="Observaciones" sortable></Column>
                        <Column
                            field="ambiente"
                            header="Ambiente"
                            body={(rowData) => ambientes.find((ambiente) => ambiente.id === rowData.ambiente)?.codigo || 'N/A'}
                            sortable
                        ></Column>
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <>
                                    <Button
                                        icon="pi pi-pencil"
                                        rounded
                                        className="mr-2"
                                        onClick={() => editActivo(rowData)}
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        rounded
                                        severity="danger"
                                        onClick={() => confirmDeleteActivo(rowData)}
                                    />
                                </>
                            )}
                        ></Column>
                    </DataTable>

                    <Dialog visible={activoDialog} style={{ width: '450px' }} header="Activo Details" modal onHide={hideDialog} footer={ambienteDialogFooter}>
                        <div className="field">
                            <label htmlFor="codigo">Código</label>
                            <InputText id="codigo" value={activo.codigo} onChange={(e) => onInputChange(e, 'codigo')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText id="descripcion" value={activo.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="marca">Marca</label>
                            <InputText id="marca" value={activo.marca} onChange={(e) => onInputChange(e, 'marca')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="modelo">Modelo</label>
                            <InputText id="modelo" value={activo.modelo} onChange={(e) => onInputChange(e, 'modelo')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="serie">Serie</label>
                            <InputText id="serie" value={activo.serie} onChange={(e) => onInputChange(e, 'serie')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="estado">Estado</label>
                            <InputText id="estado" value={activo.estado} onChange={(e) => onInputChange(e, 'estado')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="observaciones">Observaciones</label>
                            <InputText id="observaciones" value={activo.observaciones} onChange={(e) => onInputChange(e, 'observaciones')} />
                        </div>
                        <div className="field">
                            <label htmlFor="ambiente">Ambiente</label>
                            <Dropdown
                                id="ambiente"
                                value={activo.ambiente_id}
                                options={ambientes}
                                onChange={(e) => onDropdownChange(e, 'ambiente_id')}
                                optionValue="id"
                                optionLabel="displayLabel"
                                placeholder="Select Ambiente"
                                filter
                                filterBy="displayLabel"
                                filterMatchMode="contains"
                                showClear
                            />
                        </div>
                        
                    </Dialog>

                </div>
            </div>
        </div>
    );
};

export default ActivoPage;