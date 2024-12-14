import 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: {
            finalY: number;
        };
    }
}