'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { getEdificios, createEdificio, updateEdificio, deleteEdificio, Edificio } from '@/app/api/edificioApi';
import MapComponent from '@/demo/components/Map';
import { InputNumber } from 'primereact/inputnumber';

const EdificioPage: React.FC = () => {
    const emptyEdificio: Edificio = { id: 0, nombre: '', descripcion: '', pisos: 0, ubicacion_lat: 0, ubicacion_lng: 0 };

    const [edificios, setEdificios] = useState<Edificio[]>([]);
    const [edificioDialog, setEdificioDialog] = useState(false);
    const [deleteEdificioDialog, setDeleteEdificioDialog] = useState(false);
    const [edificio, setEdificio] = useState<Edificio>(emptyEdificio);
    const [submitted, setSubmitted] = useState(false);
    const dt = useRef<DataTable<Edificio[]>>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchEdificios();
    }, []);

    const fetchEdificios = async () => {
        try {
            const response = await getEdificios();
            setEdificios(response.data);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load data.' });
        }
    };

    const openNew = () => {
        setEdificio(emptyEdificio);
        setSubmitted(false);
        setEdificioDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEdificioDialog(false);
    };

    const saveEdificio = async () => {
        setSubmitted(true);

        if (edificio.nombre.trim() && edificio.ubicacion_lat && edificio.ubicacion_lng) {
            try {
                let updatedEdificios;
                if (edificio.id) {
                    const response = await updateEdificio(edificio.id, edificio);
                    updatedEdificios = edificios.map((e) => (e.id === response.data.id ? response.data : e));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Edificio Updated' });
                } else {
                    const response = await createEdificio(edificio);
                    updatedEdificios = [...edificios, response.data];
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Edificio Created' });
                }
                setEdificios(updatedEdificios);
                setEdificioDialog(false);
                setEdificio(emptyEdificio);
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not save data.' });
            }
        }
    };

    const editEdificio = (edificio: Edificio) => {
        setEdificio({ ...edificio });
        setEdificioDialog(true);
    };

    const confirmDeleteEdificio = (edificio: Edificio) => {
        setEdificio(edificio);
        setDeleteEdificioDialog(true);
    };

    const deleteEdificioConfirmed = async () => {
        try {
            await deleteEdificio(edificio.id!);
            setEdificios(edificios.filter((e) => e.id !== edificio.id));
            setDeleteEdificioDialog(false);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Edificio Deleted' });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete data.' });
        }
    };

    const onInputChange = (e: any, name: string) => {
        const val = e.value !== undefined ? e.value : e.target.value;
        setEdificio((prev) => ({ ...prev, [name]: val }));
    };
    

    const handleLocationSelect = (coordinates: [number, number]) => {
        setEdificio({
          ...edificio,
          ubicacion_lat: coordinates[1],
          ubicacion_lng: coordinates[0],
        });
      };

    const mapBuildings = edificios.map((e) => ({
        lat: e.ubicacion_lat,
        lng: e.ubicacion_lng,
        name: e.nombre,
    }));

      

    const deleteEdificioDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeleteEdificioDialog(false)} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteEdificioConfirmed} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <h3 className="mb-3">Ubicación de Todos los Edificios</h3>
                    <MapComponent buildings={mapBuildings}/>
                    <br />
                    <Toast ref={toast} />
                    <Toolbar
                        className="mb-4"
                        left={<Button label="New" icon="pi pi-plus" className="mr-2" onClick={openNew} />}
                    />
                    <DataTable
                        ref={dt}
                        value={edificios}
                        dataKey="id"
                        paginator
                        rows={10}
                        className="datatable-responsive"
                        responsiveLayout="scroll"
                        emptyMessage="No data found."
                    >
                        <Column field="nombre" header="Nombre" sortable/>
                        <Column field="descripcion" header="Descripción" sortable/>
                        <Column field="pisos" header="Pisos" sortable/>
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <>
                                    <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editEdificio(rowData)} />
                                    <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteEdificio(rowData)} />
                                </>
                            )}
                        />
                    </DataTable>

                    <Dialog
                        visible={edificioDialog}
                        header="Edificio Details"
                        modal
                        style={{ width: '70vw', height: '85vh' }}
                        onHide={hideDialog}
                        footer={
                            <>
                                <Button label="Cancel" icon="pi pi-times" onClick={hideDialog} />
                                <Button label="Save" icon="pi pi-check" onClick={saveEdificio} />
                            </>
                        }
                    >
                        <div className="grid">
                            <div className="col-4">
                                <div>
                                    <label>Nombre:</label>
                                    <InputText
                                        value={edificio.nombre}
                                        onChange={(e) => onInputChange(e, 'nombre') }
                                        required />
                                </div>
                            </div>
                            <div className="col-4">
                                <div>
                                    <label>Descripción:</label>
                                    <InputText
                                        value={edificio.descripcion}
                                        onChange={(e) => onInputChange(e, 'descripcion')}
                                        required/>
                                </div>
                            </div>
                            <div className="col-4">
                                <div>
                                    <label>Pisos:</label>
                                    <InputNumber 
                                        value={edificio.pisos} 
                                        onChange={(e) => onInputChange(e, 'pisos')} 
                                        min={1} // Valor mínimo permitido
                                        showButtons // Muestra botones para incrementar/decrementar
                                        required />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label>Ubicación</label>
                            <MapComponent
                                onLocationSelect={(coordinates) => {
                                    setEdificio({
                                    ...edificio,
                                    ubicacion_lat: coordinates[1],
                                    ubicacion_lng: coordinates[0],
                                    });
                                }}
                                initialCoordinates={
                                    edificio.ubicacion_lat && edificio.ubicacion_lng
                                    ? [edificio.ubicacion_lng, edificio.ubicacion_lat]
                                    : undefined
                                }
                                />

                            {edificio.ubicacion_lat && edificio.ubicacion_lng && (
                                <p>
                                    Lat: {edificio.ubicacion_lat}, Lng: {edificio.ubicacion_lng}
                                </p>
                            )}
                        </div>
                    </Dialog>


                    <Dialog visible={deleteEdificioDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteEdificioDialogFooter} onHide={() => setDeleteEdificioDialog(false)}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {edificio && <span>Are you sure you want to delete <b>{edificio.nombre}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default EdificioPage;
