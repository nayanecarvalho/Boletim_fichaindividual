import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, ClipboardList } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ReportCard = ({ studentData, grades }) => {
  const reportRef = useRef();

  const subjects = [
    'Português', 'Matemática', 'História', 'Geografia', 'Artes',
    'Ciências', 'Inglês', 'Educação Física', 'Ensino Religioso'
  ];

  const bimesters = ['1º Bim', '2º Bim', '3º Bim', '4º Bim'];

  const calculateFinal = (subject) => {
    const gradeValues = bimesters.map(bim => 
      parseFloat(grades?.[`${subject}-${bim}-nota`] || 0)
    );
    const absenceValues = bimesters.map(bim => 
      parseInt(grades?.[`${subject}-${bim}-faltas`] || 0)
    );
    
    const finalGrade = gradeValues.reduce((sum, grade) => sum + grade, 0) / 4;
    const totalAbsences = absenceValues.reduce((sum, absence) => sum + absence, 0);
    
    return { finalGrade: finalGrade.toFixed(1), totalAbsences };
  };

  const exportToPDF = () => {
    const input = reportRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth;
      const height = width / ratio;

      let position = 0;
      if (height < pdfHeight) {
        position = (pdfHeight - height) / 2;
      }

      pdf.addImage(imgData, 'PNG', 0, position, width, height);
      pdf.save(`boletim_${studentData.nome.replace(/ /g, '_')}.pdf`);
    });
  };

  if (!studentData) {
    
  const bimsNormalized = ['1º','2º','3º','4º'];
  const getGrade = (sub, b, type) => {
    return grades?.[`${sub}-${b}-`+type] ?? grades?.[`${sub}-${b} Bim-`+type] ?? '';
  };

  const exportToExcel = () => {
    const header = ['Disciplina', ...bimsNormalized.flatMap(b => [`${b} Nota`, `${b} Faltas (h)`]), 'Média Final', 'Total Faltas (h)'];
    const data = [header];
    subjects.forEach(sub => {
      const notas = bimsNormalized.map(b => parseFloat(getGrade(sub, b, 'nota') || 0));
      const faltas = bimsNormalized.map(b => parseFloat(getGrade(sub, b, 'faltas') || 0));
      const media = notas.reduce((a,b)=>a+b,0) / bimsNormalized.length;
      const totalF = faltas.reduce((a,b)=>a+b,0);
      const row = [sub];
      bimsNormalized.forEach((b,i)=>{
        row.push(notas[i] || '', faltas[i] || '');
      });
      row.push(Number.isFinite(media)? media.toFixed(1):'', totalF || '');
      data.push(row);
    });
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{wch:24}, ...bimsNormalized.flatMap(()=>[{wch:10},{wch:12}]), {wch:12},{wch:14}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Boletim');
    XLSX.writeFile(wb, `boletim_${(studentData?.nome||'aluno').replace(/ /g,'_')}.xlsx`);
  };

  const exportToWord = () => {
    const headerCells = [
      new TableCell({children:[new Paragraph({ children: [ new TextRun({text:'Disciplina', bold:true} ] })]}),
      ...bimsNormalized.flatMap(b => [
        new TableCell({children:[new Paragraph({ children: [ new TextRun({text:`${b} Nota`, bold:true} ] })]}),
        new TableCell({children:[new Paragraph({ children: [ new TextRun({text:`${b} Faltas (h)`, bold:true} ] })]}),
      ]),
      new TableCell({children:[new Paragraph({ children: [ new TextRun({text:'Média Final', bold:true} ] })]}),
      new TableCell({children:[new Paragraph({ children: [ new TextRun({text:'Total Faltas (h)', bold:true} ] })]}),
    ];

    const rows = subjects.map(sub => {
      const notas = bimsNormalized.map(b => parseFloat(getGrade(sub, b, 'nota') || 0));
      const faltas = bimsNormalized.map(b => parseFloat(getGrade(sub, b, 'faltas') || 0));
      const media = notas.reduce((a,b)=>a+b,0) / bimsNormalized.length;
      const totalF = faltas.reduce((a,b)=>a+b,0);
      const cells = [new TableCell({children:[new Paragraph(sub)]})];
      bimsNormalized.forEach((b,i)=>{
        cells.push(new TableCell({children:[new Paragraph(String(notas[i] || ''))]} ] });
        cells.push(new TableCell({children:[new Paragraph(String(faltas[i] || ''))]} ] });
      });
      cells.push(new TableCell({children:[new Paragraph(Number.isFinite(media)? media.toFixed(1):'')]} ] });
      cells.push(new TableCell({children:[new Paragraph(String(totalF || ''))]} ] });
      return new TableRow({children: cells});
    });

    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children:[
            new TableCell({children:[new Paragraph({ children: [ new TextRun({text:'Aluno(a)', bold:true} ] })]}),
            new TableCell({children:[new Paragraph(studentData?.nome || '')]}),
          ]
        }),
        new TableRow({
          children:[
            new TableCell({children:[new Paragraph({ children: [ new TextRun({text:'Ano/Série', bold:true} ] })]}),
            new TableCell({children:[new Paragraph(studentData?.anoSerie || '')]}),
          ]
        }),
      ]
    });

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [ new TableRow({children: headerCells}), ...rows ]
    });

    const doc = new Document({
      sections:[{
        children:[
          new Paragraph({ text: 'Boletim Escolar', heading: 'Heading1'}),
          new Paragraph(' '),
          infoTable,
          new Paragraph(' '),
          table
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => saveAs(blob, `boletim_${(studentData?.nome||'aluno').replace(/ /g,'_')}.docx`));
  };
return (
      <Card className="glass-effect p-8 text-center">
        <p className="text-gray-600">Selecione um aluno na lista para visualizar o boletim escolar.</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-end mb-4">
        <Button onClick={exportToPDF} className="flex items-center space-x-2 mr-2">
          <Download size={16} />
          <span>Exportar PDF</span>
        </Button>
              <Button onClick={exportToExcel} className="flex items-center space-x-2 mr-2">
          <Download size={16} />
          <span>Exportar Excel</span>
        </Button>
        <Button onClick={exportToWord} className="flex items-center space-x-2">
          <Download size={16} />
          <span>Exportar Word</span>
        </Button>
      </div>
      <Card ref={reportRef} className="glass-effect p-8 print-section max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <ClipboardList className="text-blue-600" size={32} />
          <h2 className="text-2xl font-bold gradient-text">Boletim Escolar - 2025</h2>
        </div>

        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold">BOLETIM ESCOLAR - 2025</h1>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Escola: </span>
              <span>{studentData.escola || 'Escola Municipal Joaquim Dias Almeida'}</span>
            </div>
            <div>
              <span className="font-semibold">Ano: </span>
              <span>2025</span>
            </div>
            <div>
              <span className="font-semibold">Aluno(a): </span>
              <span>{studentData.nome}</span>
            </div>
            <div>
              <span className="font-semibold">Ano/Série: </span>
              <span>{studentData.anoSerie}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-left font-bold">DISCIPLINAS</th>
                {bimesters.map((bim, index) => <th key={index} className="border border-gray-400 p-1 text-xs font-semibold">{bim}</th>).slice(0, 4)}
                {bimesters.map((bim, index) => <th key={index+4} className="border border-gray-400 p-1 text-xs font-semibold">{bim}</th>).slice(0, 4)}
                <th className="border border-gray-400 p-1 text-xs font-semibold">Total de Faltas</th>
                <th className="border border-gray-400 p-1 text-xs font-semibold">Resultado Final</th>
              </tr>
              <tr className="bg-gray-50">
                 <th className="border border-gray-400 p-1"></th>
                 <th className="border border-gray-400 p-1 text-xs font-semibold" colSpan="4">Notas</th>
                 <th className="border border-gray-400 p-1 text-xs font-semibold" colSpan="4">Faltas</th>
                 <th className="border border-gray-400 p-1"></th>
                 <th className="border border-gray-400 p-1"></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => {
                const { finalGrade, totalAbsences } = calculateFinal(subject);
                return (
                  <tr key={subject}>
                    <td className="border border-gray-400 p-2 font-semibold">{subject}</td>
                    {bimesters.map(bim => (
                      <td key={`nota-${subject}-${bim}`} className="border border-gray-400 p-2 text-center">
                        {grades?.[`${subject}-${bim}-nota`] || '-'}
                      </td>
                    ))}
                    {bimesters.map(bim => (
                      <td key={`falta-${subject}-${bim}`} className="border border-gray-400 p-2 text-center">
                        {grades?.[`${subject}-${bim}-faltas`] || '-'}
                      </td>
                    ))}
                    <td className="border border-gray-400 p-2 text-center font-semibold">
                      {totalAbsences}
                    </td>
                    <td className="border border-gray-400 p-2 text-center font-semibold">
                      {finalGrade}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-xs">
          <p className="font-semibold mb-2">Observações:</p>
          <p>Na avaliação do aproveitamento dos alunos serão adotados sistemas de pontos cumulativos. Será de 100 (cem) o número de pontos cumulativos que cada aluno poderá conseguir durante um ano letivo.</p>
          <p className="mt-2">
            Os 100(cem) pontos serão assim distribuídos: 1º Bimestre - Total ( 25 Pontos) Mínimo (15 Pontos)
            2º Bimestre - Total ( 25 Pontos) Mínimo (15 Pontos) 3º Bimestre - Total ( 25 Pontos) Mínimo (15 Pontos)
            4º Bimestre - Total ( 25 Pontos) Mínimo (15 Pontos)
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-sm">
          <div>
            <div className="border-t border-gray-400 pt-2">
              <span className="font-semibold">1º Bimestre:</span>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2">
              <span className="font-semibold">2º Bimestre:</span>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2">
              <span className="font-semibold">3º Bimestre:</span>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2">
              <span className="font-semibold">4º Bimestre:</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 text-center text-sm">
          <div>
            <div className="border-t border-gray-400 pt-2 mt-8">
              <span className="font-semibold">Assinatura do responsável:</span>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2 mt-8">
              <span className="font-semibold">Assinatura do(a) Diretor(a):</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReportCard;