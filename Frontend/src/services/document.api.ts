import { USE_MOCKS } from "@/lib/api-client";
import { OCRResult } from "@/types/document";
import { ApiResponse } from "@/types/api";

export async function processDocumentOCR(
  file: File
): Promise<ApiResponse<OCRResult>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      data: {
        documentId: "doc-mock-99",
        fileName: file.name,
        extractedText: "Sample extracted OCR text from uploaded legal agreement...",
        summary: "Rental agreement containing lock-in clause and deposit refund terms.",
        detectedDates: [
          { label: "Execution Date", date: "01 April 2026" },
          { label: "Expiry Date", date: "01 March 2027" },
        ],
        risks: [
          {
            clause: "Clause 14 Lock-In Penalty",
            riskLevel: "HIGH",
            explanation: "Unilateral penalty clause requiring full rent payment.",
            recommendation: "Negotiate reciprocal termination clause.",
          },
        ],
        missingChecklist: [
          { item: "Identity Proof", status: "VERIFIED" },
          { item: "Bank Receipt", status: "MISSING" },
        ],
      },
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("legalai-token") : null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"}/documents/ocr`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "OCR Processing Failed";
    return {
      success: false,
      data: null as unknown as OCRResult,
      error: { code: "OCR_FAILURE", message: errMsg },
    };
  }
}
