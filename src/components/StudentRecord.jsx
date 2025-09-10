import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Download, Save, Trash2, Edit, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const StudentRecord = ({ studentData, grades, onGradesUpdate, onUpdateStudent, onDeleteStudent }) => {
  const [localGrades, setLocalGrades] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editableStudentData, setEditableStudentData] = useState(studentData);
  const recordRef = useRef();

  const subjects = [
    'Língua Portuguesa', 'Matemática', 'História', 'Geografia', 'Artes',
    'Ciências', 'Ensino Religioso', 'Educação Física', 'Inglês'
  ];
  const partDiversificada = ['L.E.M', 'Inglês'];

  const bimesters = ['1º', '2º', '3º', '4º'];

  useEffect(() => {
    setLocalGrades(grades || {});
    setEditableStudentData(studentData || {});
  }, [grades, studentData]);

  const handleGradeChange = (subject, bimester, type, value) => {
    const key = `${subject}-${bimester}-${type}`;
    setLocalGrades(prev => ({ ...prev, [key]: value }));
  };
  
  const handleStudentDataChange = (field, value) => {
    setEditableStudentData(prev => ({...prev, [field]: value}));
  };

  const saveAllData = () => {
    onGradesUpdate(localGrades);
    if (isEditing) {
        onUpdateStudent(editableStudentData);
        setIsEditing(false);
    }
    toast({ title: "Sucesso!", description: "Dados salvos com sucesso!" });
  };

  const exportToPDF = () => {
    const input = recordRef.current;
    html2canvas(input, { scale: 3, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      let width = pdfWidth;
      let height = width / ratio;
      if (height > pdfHeight) {
        height = pdfHeight;
        width = height * ratio;
      }
      const x = (pdfWidth - width) / 2;
      pdf.addImage(imgData, 'PNG', x, 0, width, height);
      pdf.save(`ficha_${studentData.nome.replace(/ /g, '_')}.pdf`);
    });
  };

  
const exportToWord = () => {
    // Table: Student info
    const infoRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children:[new TextRun({text:'Nome do Aluno', bold:true})] })]}),
          new TableCell({ children: [new Paragraph(studentData.nome || '')]}),
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children:[new TextRun({text:'Data de Nascimento', bold:true})] })]}),
          new TableCell({ children: [new Paragraph(studentData.dataNascimento || '')]}),
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children:[new TextRun({text:'Sexo', bold:true})] })]}),
          new TableCell({ children: [new Paragraph(studentData.sexo || '')]}),
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children:[new TextRun({text:'Filiação (Pai e Mãe)', bold:true})] })]}),
          new TableCell({ children: [new Paragraph(`${studentData.pai || ''} / ${studentData.mae || ''}`)]}),
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children:[new TextRun({text:'Naturalidade / Estado / Nacionalidade', bold:true})] })]}),
          new TableCell({ children: [new Paragraph(`${studentData.naturalidade || ''} / ${studentData.estado || ''} / ${studentData.nacionalidade || ''}`)]}),
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children:[new TextRun({text:'Ano / Série', bold:true})] })]}),
          new TableCell({ children: [new Paragraph(studentData.anoSerie || '')]}),
        ]
      }),
    ];

    // Header for grades/faltas
    const bims = ['1º','2º','3º','4º'];
    const header = [
      new TableCell({ children:[new Paragraph({children:[new TextRun({text:'Disciplina', bold:true})]})]}),
      ...bims.flatMap(b => [
        new TableCell({ children:[new Paragraph({children:[new TextRun({text:`${b} Nota`, bold:true})]})]}),
        new TableCell({ children:[new Paragraph({children:[new TextRun({text:`${b} Faltas (h)`, bold:true})]})]}),
      ]),
    ];

    const subjects = ['Língua Portuguesa','Matemática','História','Geografia','Artes','Ciências','Ensino Religioso','Educação Física','Inglês'];
    const rows = subjects.map(sub => {
      const cells = [new TableCell({children:[new Paragraph(sub)]})];
      bims.forEach(b => {
        const nota = localGrades[`${sub}-${b}-nota`] ?? localGrades[`${sub}-${b} Bim-nota`] ?? '';
        const faltas = localGrades[`${sub}-${b}-faltas`] ?? localGrades[`${sub}-${b} Bim-faltas`] ?? '';
        cells.push(new TableCell({children:[new Paragraph(String(nota))]}));
        cells.push(new TableCell({children:[new Paragraph(String(faltas))]}));
      });
      return new TableRow({children: cells});
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: 'Ficha Individual do Aluno', heading: 'Heading1' }),
          new Paragraph({ text: ' ' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: infoRows
          }),
          new Paragraph({ text: ' ' }),
          new Paragraph({ text: 'Notas e Faltas (por bimestre)', heading: 'Heading2' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({children: header}),
              ...rows,
            ]
          }),
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `ficha_${(studentData.nome || 'aluno').replace(/ /g,'_')}.docx`);
    });
};


  
const exportToExcel = () => {
    const bims = ['1º','2º','3º','4º'];
    const header = ['Disciplina', ...bims.flatMap(b => [`${b} Nota`, `${b} Faltas (h)`])];
    const subjects = ['Língua Portuguesa','Matemática','História','Geografia','Artes','Ciências','Ensino Religioso','Educação Física','Inglês'];

    const data = [header];
    subjects.forEach(sub => {
      const row = [sub];
      bims.forEach(b => {
        const nota = localGrades[`${sub}-${b}-nota`] ?? localGrades[`${sub}-${b} Bim-nota`] ?? '';
        const faltas = localGrades[`${sub}-${b}-faltas`] ?? localGrades[`${sub}-${b} Bim-faltas`] ?? '';
        row.push(nota, faltas);
      });
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Set column widths
    const wscols = [{wch:24}, ...bims.flatMap(()=>[{wch:10},{wch:12}])];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ficha');
    XLSX.writeFile(wb, `ficha_${(studentData.nome || 'aluno').replace(/ /g,'_')}.xlsx`);
};


  if (!studentData) {
    return (
      <Card className="glass-effect p-8 text-center">
        <p className="text-gray-600">Selecione um aluno na lista para visualizar a ficha individual.</p>
      </Card>
    );
  }
  
  const displayData = isEditing ? editableStudentData : studentData;

  const renderField = (label, value, fieldName, type = 'text', containerClass = '', inputClass = '') => (
    <div className={`border border-black p-1 ${containerClass}`}>
      <div className="text-xs font-bold">{label}</div>
      {isEditing ? (
        <Input type={type} value={displayData[fieldName] || ''} onChange={e => handleStudentDataChange(fieldName, e.target.value)} className={`h-6 text-xs p-1 border-blue-400 ${inputClass}`} />
      ) : (
        <div className="text-xs">{value}</div>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
      <div className="flex justify-end gap-2 flex-wrap">
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'default' : 'outline'} className="flex items-center space-x-2">
            <Edit size={16} /><span>{isEditing ? 'Cancelar' : 'Editar'}</span>
        </Button>
        <Button onClick={saveAllData} className="flex items-center space-x-2"><Save size={16} /><span>Salvar</span></Button>
        <Button onClick={() => onDeleteStudent(studentData.id)} variant="destructive" className="flex items-center space-x-2">
            <Trash2 size={16} /><span>Excluir</span>
        </Button>
        <Button onClick={exportToPDF} variant="outline" className="flex items-center space-x-2"><Download size={16} /><span>PDF</span></Button>
        <Button onClick={exportToWord} variant="outline" className="flex items-center space-x-2"><FileText size={16} /><span>Word</span></Button>
        <Button onClick={exportToExcel} variant="outline" className="flex items-center space-x-2"><FileSpreadsheet size={16} /><span>Excel</span></Button>
      </div>

      <Card ref={recordRef} className="p-4 bg-white text-black print-section max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-2">
          <div className="w-24 h-24 flex items-center justify-center">
            <img  alt="Brasão do estado de Minas Gerais" className="w-20 h-20" src="https://images.unsplash.com/photo-1551035418-0b04d6d183be" />
          </div>
          <div className="text-center flex-grow">
            <h1 className="text-sm font-bold uppercase">{displayData.escola}</h1>
            <p className="text-xs">SECRETARIA MUNICIPAL DE EDUCAÇÃO</p>
            <p className="text-xs">{displayData.cidade}</p>
            <p className="text-xs">{displayData.endereco}</p>
            <p className="text-xs">CEP:{displayData.cep}</p>
          </div>
          <div className="w-24"></div>
        </div>
        <h2 className="text-sm font-bold text-center mb-2">FICHA INDIVIDUAL DO ALUNO - ENSINO FUNDAMENTAL</h2>

        <div className="border-y-2 border-black">
          <div className="grid grid-cols-12">
            <div className="col-span-8 border-r border-black p-1">
              <div className="text-xs font-bold">Nome do Aluno:</div>
              <div className="text-xs">{displayData.nome}</div>
            </div>
            <div className="col-span-4 p-1">
              <div className="text-xs font-bold">Filiação:</div>
            </div>
          </div>
          <div className="grid grid-cols-12 border-t border-black">
            {renderField("Data de Nascimento", displayData.dataNascimento ? new Date(displayData.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '', "dataNascimento", "date", "col-span-2")}
            {renderField("Sexo", displayData.sexo, "sexo", "text", "col-span-1")}
            <div className="col-span-9 border-l border-black p-1">
              <div className="text-xs"><span className="font-bold">Pai:</span> {displayData.pai}</div>
              <div className="text-xs"><span className="font-bold">Mãe:</span> {displayData.mae}</div>
            </div>
          </div>
          <div className="grid grid-cols-12 border-t border-black">
            {renderField("Nacionalidade", displayData.nacionalidade, "nacionalidade", "text", "col-span-3")}
            {renderField("Naturalidade", displayData.naturalidade, "naturalidade", "text", "col-span-3")}
            {renderField("Estado", displayData.estado, "estado", "text", "col-span-2")}
          </div>
          <div className="grid grid-cols-12 border-t border-black">
            {renderField("Ano", displayData.ano, "ano", "text", "col-span-1")}
            {renderField("Ano(Série)", displayData.anoSerie, "anoSerie", "text", "col-span-2")}
            {renderField("Mín. Promoção", displayData.minPromocao, "minPromocao", "text", "col-span-2")}
            {renderField("Dias Letivos", displayData.diasLetivos, "diasLetivos", "text", "col-span-2")}
            {renderField("C.H. Anual", displayData.chAnual, "chAnual", "text", "col-span-2")}
            {renderField("Módulo/aula", displayData.moduloAula, "moduloAula", "text", "col-span-3")}
          </div>
        </div>

        <table className="w-full border-collapse border-2 border-black mt-2 text-xs">
          <thead>
            <tr className="text-center">
              <td className="border border-black" rowSpan="2">Bimestres</td>
              <td className="border border-black" rowSpan="2" style={{width: '100px'}}>Verificação do Rendimento</td>
              <td className="border border-black" colSpan={subjects.length}>BASE NACIONAL COMUM</td>
              <td className="border border-black" colSpan={partDiversificada.length}>PARTE DIVERSIFICADA</td>
              <td className="border border-black" rowSpan="2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>Situação do Aluno</td>
            </tr>
            <tr className="text-center">
              {[...subjects, ...partDiversificada].map(s => <td key={s} className="border border-black p-0" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontSize: '10px'}}>{s}</td>)}
            </tr>
          </thead>
          <tbody>
            {bimesters.map(bim => (
              <React.Fragment key={bim}>
                <tr>
                  <td className="border border-black text-center" rowSpan="3">{bim}</td>
                  <td className="border border-black px-1">Aproveitamento</td>
                  {[...subjects, ...partDiversificada].map(sub => <td key={`${sub}-aprov`} className="border border-black p-0"><Input type="text" className="w-full h-5 text-xs text-center p-0 border-0 rounded-none" value={localGrades[`${sub}-${bim}-nota`] || ''} onChange={e => handleGradeChange(sub, bim, 'nota', e.target.value)} /></td>)}
                  <td className="border border-black" rowSpan="3"></td>
                </tr>
                <tr>
                  <td className="border border-black px-1">Carga Horária</td>
                  {[...subjects, ...partDiversificada].map(sub => <td key={`${sub}-carga`} className="border border-black p-0"><Input type="text" className="w-full h-5 text-xs text-center p-0 border-0 rounded-none" /></td>)}
                </tr>
                <tr>
                  <td className="border border-black px-1">Faltas/horas</td>
                  {[...subjects, ...partDiversificada].map(sub => <td key={`${sub}-faltas`} className="border border-black p-0"><Input type="text" className="w-full h-5 text-xs text-center p-0 border-0 rounded-none" value={localGrades[`${sub}-${bim}-faltas`] || ''} onChange={e => handleGradeChange(sub, bim, 'faltas', e.target.value)} /></td>)}
                </tr>
              </React.Fragment>
            ))}
            {['Total Geral', 'Estudos Orientados Presenciais'].map(section => (
              <React.Fragment key={section}>
                <tr>
                  <td className="border border-black text-center" rowSpan={section === 'Total Geral' ? 3 : 1}>{section}</td>
                  <td className="border border-black px-1">Aproveitamento</td>
                  {[...subjects, ...partDiversificada].map((_, i) => <td key={`total-aprov-${i}`} className="border border-black"></td>)}
                  <td className="border border-black" rowSpan={section === 'Total Geral' ? 3 : 1}></td>
                </tr>
                {section === 'Total Geral' && <>
                  <tr><td className="border border-black px-1">Carga Horária</td>{[...Array(11)].map((_, i) => <td key={`total-carga-${i}`} className="border border-black"></td>)}</tr>
                  <tr><td className="border border-black px-1">Faltas/horas</td>{[...Array(11)].map((_, i) => <td key={`total-faltas-${i}`} className="border border-black"></td>)}</tr>
                </>}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="border-2 border-black mt-2 text-xs">
          <div className="text-center font-bold border-b border-black">ESTUDOS INDEPENDENTES</div>
          <div className="grid grid-cols-12">
            <div className="col-span-1 border-r border-black p-1">Aproveitamento</div>
            {[...Array(11)].map((_, i) => <div key={`ind-aprov-${i}`} className="col-span-1 border-r border-black last:border-r-0 p-1 h-6"></div>)}
          </div>
        </div>

        <div className="border-2 border-black mt-2 text-xs">
          <div className="text-center font-bold border-b-2 border-black">Situação do Aluno: PROGRESSÃO PARCIAL (Res. 521/04 SEE, Art. 39, Itens IV e V)</div>
          <div className="text-center font-bold border-b border-black">Verificação do Rendimento</div>
          <table className="w-full">
            <thead>
              <tr>
                <td className="border border-black" rowSpan="2">ANO (Série)</td>
                <td className="border border-black" rowSpan="2">Componentes Curriculares</td>
                <td className="border border-black" colSpan="4">1º SEMESTRE</td>
                <td className="border border-black" colSpan="4">2º SEMESTRE</td>
                <td className="border border-black" rowSpan="2">Situação do Aluno</td>
              </tr>
              <tr>
                <td className="border border-black">Aproveitamento valor:</td>
                <td className="border border-black">Aproveitamento valor:</td>
                <td className="border border-black">Aproveitamento valor:</td>
                <td className="border border-black">TOTAL</td>
                <td className="border border-black">Aproveitamento valor:</td>
                <td className="border border-black">Aproveitamento valor:</td>
                <td className="border border-black">Aproveitamento valor:</td>
                <td className="border border-black">TOTAL</td>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={`prog-${i}`}>
                  {[...Array(11)].map((_, j) => <td key={`prog-cell-${i}-${j}`} className="border border-black h-6"></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-2 border-black mt-2 text-xs p-1">
          <div className="font-bold">OBSERVAÇÕES:</div>
          <div className="h-16"></div>
        </div>
        
        <div className="mt-8 flex justify-between text-xs">
            <div className="w-1/2 text-center">
                <div className="border-t border-black mt-8 mx-4"></div>
                <p>Ass. do(a) Secretário(a).</p>
            </div>
            <div className="w-1/2 text-center">
                <div className="border-t border-black mt-8 mx-4"></div>
                <p>Diretor(a) - nº de Reg. ou Aut.</p>
            </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StudentRecord;