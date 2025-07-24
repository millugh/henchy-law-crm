import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

/* Fallback download helper – replaces file-saver */
function saveAs(blob: Blob, filename: string) {
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

type Data = Record<string, unknown>[]
type Headers = string[]

export const exportToPDF = (data: Data, headers: Headers, title: string, filename: string) => {
  const doc = new jsPDF()
  autoTable(doc, {
    head: [headers],
    body: data.map((row) => headers.map((header) => String(row[header.toLowerCase().replace(/ /g, "_")] || ''))),
    didDrawPage: (data) => {
      doc.text(title, data.settings.margin.left, 15)
    },
  })
  doc.save(`${filename}.pdf`)
}

export const exportToExcel = (data: Data, filename: string, sheetName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
  saveAs(blob, `${filename}.xlsx`)
}
