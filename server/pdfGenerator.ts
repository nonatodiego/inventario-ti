import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

export async function generateUserInventoryPDF(record: any, systemAccess: any[] = []): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    let y = 800;
    const lineHeight = 15;
    const margin = 50;
    
    // Helper function to draw text
    const drawLine = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      page.drawText(text, {
        x: margin,
        y: y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    };
    
    // Title
    drawLine('RELATÓRIO DE INVENTÁRIO DE TI', 16);
    y -= 10;
    
    // User Info
    drawLine('INFORMAÇÕES DO USUÁRIO', 13);
    y -= 5;
    drawLine(`Nome: ${record.userName || '-'}`);
    drawLine(`Cargo: ${record.userRole || '-'}`);
    drawLine(`Localização: ${record.location || '-'}`);
    drawLine(`Gestor: ${record.manager || '-'}`);
    drawLine(`Licença: ${record.emailLicense || '-'}`);
    
    const regDate = record.regDate ? new Date(record.regDate).toLocaleDateString('pt-BR') : '-';
    drawLine(`Data de Cadastro: ${regDate}`);
    
    y -= 10;
    drawLine('RECURSOS ATRIBUÍDOS', 13);
    y -= 5;
    
    // Resources
    const resources = [];
    if (record.hasPhone) resources.push('Celular');
    if (record.hasMonitor) resources.push('Monitor');
    if (record.hasMouse) resources.push('Mouse');
    if (record.hasKeyboard) resources.push('Teclado');
    if (record.hasHeadset) resources.push('Headset');
    if (record.hasNotebook) resources.push('Notebook');
    if (record.hasNotebookStand) resources.push('Suporte Notebook');
    if (record.hasDesktop) resources.push('Desktop');
    
    if (resources.length === 0) {
      drawLine('Nenhum recurso atribuído');
    } else {
      resources.forEach(r => drawLine(`• ${r}`));
    }
    
    y -= 10;
    drawLine('DETALHES DOS EQUIPAMENTOS', 13);
    y -= 5;
    
    // Phone details
    if (record.hasPhone) {
      drawLine('Celular:');
      if (record.phoneChip) drawLine(`  Chip: ${record.phoneChip}`);
      if (record.phoneIMEI) drawLine(`  IMEI: ${record.phoneIMEI}`);
      if (record.phonePulsusId) drawLine(`  ID Pulsus: ${record.phonePulsusId}`);
    }
    
    // Notebook details
    if (record.hasNotebook) {
      drawLine('Notebook:');
      if (record.notebookSerialNumber) drawLine(`  Série: ${record.notebookSerialNumber}`);
      if (record.notebookHostname) drawLine(`  Hostname: ${record.notebookHostname}`);
    }
    
    // Desktop details
    if (record.hasDesktop) {
      drawLine('Desktop:');
      if (record.desktopSerialNumber) drawLine(`  Série: ${record.desktopSerialNumber}`);
      if (record.desktopHostname) drawLine(`  Hostname: ${record.desktopHostname}`);
    }
    
    y -= 10;
    drawLine('TERMO DE USO', 13);
    y -= 5;
    
    const termStatus = record.termAttached ? 'ASSINADO' : 'PENDENTE';
    drawLine(`Status: ${termStatus}`);

    y -= 10;
    drawLine('ACESSOS A SISTEMAS', 13);
    y -= 5;
    
    if (systemAccess.length === 0) {
      drawLine('Nenhum acesso a sistema configurado');
    } else {
      systemAccess.forEach(access => {
        const sysName = access.system?.name || 'Desconhecido';
        const profileName = access.profile?.name || 'Desconhecido';
        drawLine(`• ${sysName} - Perfil: ${profileName}`);
        if (access.notes) {
          drawLine(`  Nota: ${access.notes}`, 9);
        }
      });
    }
    
    // Footer
    page.drawText(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      {
        x: margin,
        y: 30,
        size: 9,
        color: rgb(0.5, 0.5, 0.5),
      }
    );
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
