'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import axios, { AxiosError } from 'axios';
import { getAmbientes, createAmbiente, updateAmbiente, deleteAmbiente, Ambiente } from '@/app/api/ambienteApi';
import { Dropdown } from 'primereact/dropdown';

const AmbientePage = () => {
    const emptyAmbiente: Ambiente = {
        id: 0,
        codigo: '',
        ubicacion: '',
        capacidad: 0,
        departamento: null,
        escuela: null,
        tipo_ambiente: null,
    };

    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    const [ambienteDialog, setAmbienteDialog] = useState(false);
    const [deleteAmbienteDialog, setDeleteAmbienteDialog] = useState(false);
    const [ambiente, setAmbiente] = useState<Ambiente>(emptyAmbiente);
    const [selectedAmbientes, setSelectedAmbientes] = useState<Ambiente[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Ambiente[]>>(null); // Reference for DataTable export

    useEffect(() => {
        fetchAmbientes();
    }, []);

    const fetchAmbientes = async () => {
        try {
            const response = await getAmbientes();
            setAmbientes(response.data.results);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load data.' });
        }
    };

    const openNew = () => {
        setAmbiente(emptyAmbiente);
        setSubmitted(false);
        setAmbienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAmbienteDialog(false);
    };

    const hideDeleteAmbienteDialog = () => {
        setDeleteAmbienteDialog(false);
    };

    const saveAmbiente = async () => {
        setSubmitted(true);
    
        const formattedAmbiente = {
            ...ambiente,
            capacidad: ambiente.capacidad || 0,
            departamento: typeof ambiente.departamento === 'object' && ambiente.departamento !== null ? ambiente.departamento.id : ambiente.departamento,
            escuela: typeof ambiente.escuela === 'object' && ambiente.escuela !== null ? ambiente.escuela.id : ambiente.escuela,
            tipo_ambiente: typeof ambiente.tipo_ambiente === 'object' && ambiente.tipo_ambiente !== null ? ambiente.tipo_ambiente.id : ambiente.tipo_ambiente,
        };
    
        if (formattedAmbiente.codigo.trim()) {
            try {
                let updatedAmbientes;
                if (formattedAmbiente.id) {
                    const response = await updateAmbiente(formattedAmbiente.id, formattedAmbiente);
                    updatedAmbientes = ambientes.map((a) => (a.id === response.data.id ? response.data : a));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Ambiente Updated', life: 3000 });
                } else {
                    const response = await createAmbiente(formattedAmbiente);
                    updatedAmbientes = [...ambientes, response.data];
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Ambiente Created', life: 3000 });
                }
                setAmbientes(updatedAmbientes);
                setAmbienteDialog(false);
                setAmbiente(emptyAmbiente);
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {  // Check if error is an AxiosError
                    // You can now safely access error.response
                    const responseData = error.response?.data; 
                    console.error("Backend error details:", responseData);
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: responseData?.message || 'Could not save data.' });
                } else {
                    // Handle other unexpected errors
                    console.error("Unexpected error:", error);
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
                }
            }
        }
    };

    const editAmbiente = (ambiente: Ambiente) => {
        setAmbiente({ ...ambiente });
        setAmbienteDialog(true);
    };

    const confirmDeleteAmbiente = (ambiente: Ambiente) => {
        setAmbiente(ambiente);
        setDeleteAmbienteDialog(true);
    };

    const deleteAmbienteConfirmed = async () => {
        try {
            await deleteAmbiente(ambiente.id!);
            setAmbientes(ambientes.filter((a) => a.id !== ambiente.id));
            setDeleteAmbienteDialog(false);
            setAmbiente(emptyAmbiente);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Ambiente Deleted', life: 3000 });
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete data.' });
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setAmbiente({ ...ambiente, [name]: val });
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteAmbienteDialog(true);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedAmbientes.length} />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const ambienteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveAmbiente} />
        </>
    );

    const deleteAmbienteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteAmbienteDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteAmbienteConfirmed} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={ambientes}
                        selectionMode="multiple"
                        selection={selectedAmbientes}
                        onSelectionChange={(e) => setSelectedAmbientes(e.value as Ambiente[])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} ambientes"
                        globalFilter={globalFilter}
                        header={<h5 className="m-0">Manage Ambientes</h5>}
                        responsiveLayout="scroll"
                        emptyMessage="No data found."
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="codigo" header="Código" sortable></Column>
                        <Column field="ubicacion" header="Ubicación" sortable></Column>
                        <Column field="capacidad" header="Capacidad" sortable></Column>
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <>
                                    <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editAmbiente(rowData)} />
                                    <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteAmbiente(rowData)} />
                                </>
                            )}
                        ></Column>
                    </DataTable>

                    <Dialog visible={ambienteDialog} style={{ width: '450px' }} header="Ambiente Details" modal footer={ambienteDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="codigo">Código</label>
                            <InputText id="codigo" value={ambiente.codigo} onChange={(e) => onInputChange(e, 'codigo')} required autoFocus className={classNames({ 'p-invalid': submitted && !ambiente.codigo })} />
                            {submitted && !ambiente.codigo && <small className="p-invalid">Código is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="ubicacion">Ubicación</label>
                            <InputText id="ubicacion" value={ambiente.ubicacion} onChange={(e) => onInputChange(e, 'ubicacion')} />
                        </div>
                    </Dialog>

                    <Dialog visible={deleteAmbienteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteAmbienteDialogFooter} onHide={hideDeleteAmbienteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {ambiente && <span>Are you sure you want to delete <b>{ambiente.codigo}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default AmbientePage;