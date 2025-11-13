
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { AIAnalysisButton } from "./ai-analysis-button";
import dynamic from "next/dynamic";

// @ts-ignore
const Plot = dynamic(() => import("react-plotly.js"), { 
  ssr: false,
  loading: () => <div className="text-center py-8">Grafik yükleniyor...</div>
});

interface TestResultsDetailProps {
  test: any;
  userRole: string;
}

export function TestResultsDetail({ test, userRole }: TestResultsDetailProps) {
  const testResults = test.notes ? JSON.parse(test.notes) : null;

  const testTypeNames: { [key: string]: string } = {
    BECK_DEPRESSION: "Beck Depresyon Ölçeği",
    BECK_ANXIETY: "Beck Anksiyete Ölçeği",
    SCL_90: "SCL-90 Belirti Tarama Listesi",
    MMPI: "Minnesota Çok Yönlü Kişilik Envanteri",
    OTOMATIK_DUSUNCELER: "Otomatik Düşünceler Ölçeği",
  };

  const getSeverityColor = (severity: string) => {
    if (!severity) return "bg-gray-500";
    const lower = severity.toLowerCase();
    if (lower.includes("minimal") || lower.includes("düşük") || lower.includes("normal")) {
      return "bg-green-500";
    }
    if (lower.includes("hafif") || lower.includes("mild")) {
      return "bg-yellow-500";
    }
    if (lower.includes("orta") || lower.includes("moderate")) {
      return "bg-orange-500";
    }
    if (lower.includes("şiddetli") || lower.includes("severe")) {
      return "bg-red-500";
    }
    return "bg-blue-500";
  };

  const handleExport = () => {
    window.location.href = `/api/tests/export?testId=${test.id}`;
  };

  // Render SCL-90 specific results
  const renderSCL90Results = () => {
    if (!testResults) return null;

    const dimensions = testResults.dimensions || {};
    const globalIndices = testResults.globalIndices || {};

    const dimensionData = Object.entries(dimensions).map(([key, value]: [string, any]) => ({
      dimension: key,
      score: parseFloat(value.score || "0"),
      severity: value.severity || "",
    }));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global İndeksler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">GSI</div>
                <div className="text-2xl font-bold text-gray-900">
                  {globalIndices.GSI || "0"}
                </div>
                <div className="text-xs text-gray-500">Genel Şiddet İndeksi</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">PSDI</div>
                <div className="text-2xl font-bold text-gray-900">
                  {globalIndices.PSDI || "0"}
                </div>
                <div className="text-xs text-gray-500">Belirti Rahatsızlık İndeksi</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">PST</div>
                <div className="text-2xl font-bold text-gray-900">
                  {globalIndices.PST || "0"}
                </div>
                <div className="text-xs text-gray-500">Pozitif Belirti Toplamı</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boyut Skorları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dimensionData.map((dim) => (
                <div key={dim.dimension} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dim.dimension}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{dim.score.toFixed(2)}</span>
                      <Badge className={getSeverityColor(dim.severity)}>
                        {dim.severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((dim.score / 4) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {dimensionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Boyut Skorları Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "bar",
                    x: dimensionData.map((d) => d.dimension),
                    y: dimensionData.map((d) => d.score),
                    marker: {
                      color: dimensionData.map((d) => {
                        const severity = d.severity.toLowerCase();
                        if (severity.includes("normal")) return "#10b981";
                        if (severity.includes("hafif")) return "#eab308";
                        if (severity.includes("orta")) return "#f97316";
                        return "#ef4444";
                      }),
                    },
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 50, r: 30, t: 30, b: 100 },
                  xaxis: { tickangle: -45 },
                  yaxis: { title: { text: "Skor" } },
                }}
                config={{ responsive: true }}
                useResizeHandler={true}
                style={{ width: "100%", height: "400px" }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render MMPI specific results
  const renderMMPIResults = () => {
    if (!testResults) return null;

    const scales = testResults.validityScales || {};
    const clinicalScales = testResults.clinicalScales || {};

    const scaleData = [
      ...Object.entries(scales).map(([key, value]: [string, any]) => ({
        scale: key,
        score: value.tScore || 0,
        type: "Geçerlik",
      })),
      ...Object.entries(clinicalScales).map(([key, value]: [string, any]) => ({
        scale: key,
        score: value.tScore || 0,
        type: "Klinik",
      })),
    ];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Geçerlik Ölçekleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(scales).map(([key, value]: [string, any]) => (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">{key}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {value.tScore || "0"}
                  </div>
                  <div className="text-xs text-gray-500">T-Skoru</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Klinik Ölçekler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(clinicalScales).map(([key, value]: [string, any]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{value.name || key}</span>
                    <span className="text-sm font-bold">{value.tScore || "0"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (value.tScore || 0) >= 65
                          ? "bg-red-600"
                          : (value.tScore || 0) >= 55
                          ? "bg-yellow-600"
                          : "bg-green-600"
                      }`}
                      style={{
                        width: `${Math.min(((value.tScore || 0) / 100) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {scaleData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>MMPI Profil Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "scatter",
                    mode: "lines+markers",
                    x: scaleData.map((d) => d.scale),
                    y: scaleData.map((d) => d.score),
                    line: { color: "#0d9488", width: 2 },
                    marker: { size: 8, color: "#0d9488" },
                  },
                  {
                    type: "scatter",
                    mode: "lines",
                    x: scaleData.map((d) => d.scale),
                    y: Array(scaleData.length).fill(65),
                    line: { color: "red", width: 1, dash: "dash" },
                    name: "Klinik Eşik (65)",
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 50, r: 30, t: 30, b: 80 },
                  xaxis: { tickangle: -45 },
                  yaxis: { title: { text: "T-Skoru" }, range: [0, 100] },
                  showlegend: true,
                }}
                config={{ responsive: true }}
                useResizeHandler={true}
                style={{ width: "100%", height: "400px" }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render Otomatik Düşünceler specific results
  const renderOtomatikDusuncelerResults = () => {
    if (!testResults) return null;

    const subscales = testResults.subscales || {};

    const subscaleData = Object.entries(subscales).map(([key, value]: [string, any]) => ({
      subscale: value.name || key,
      score: value.score || 0,
      severity: value.severity || "",
    }));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alt Ölçek Skorları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscaleData.map((sub) => (
                <div key={sub.subscale} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sub.subscale}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{sub.score}</span>
                      <Badge className={getSeverityColor(sub.severity)}>
                        {sub.severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((sub.score / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {subscaleData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alt Ölçekler Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "bar",
                    x: subscaleData.map((d) => d.subscale),
                    y: subscaleData.map((d) => d.score),
                    marker: { color: "#0d9488" },
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 50, r: 30, t: 30, b: 120 },
                  xaxis: { tickangle: -45 },
                  yaxis: { title: { text: "Skor" } },
                }}
                config={{ responsive: true }}
                useResizeHandler={true}
                style={{ width: "100%", height: "400px" }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {testTypeNames[test.testType] || test.testType}
              </CardTitle>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span>Danışan: {test.client.user.name}</span>
                <span>•</span>
                <span>
                  Tarih: {test.completedAt?.toLocaleDateString("tr-TR")}
                </span>
                {test.personnel && (
                  <>
                    <span>•</span>
                    <span>Uygulayan: {test.personnel.user.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {["PSYCHOLOGIST", "ADMINISTRATOR"].includes(userRole) && (
                <AIAnalysisButton testId={test.id} />
              )}
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Dışa Aktar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {test.totalScore !== null && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Toplam Skor</div>
                <div className="text-3xl font-bold text-gray-900">
                  {test.totalScore}
                </div>
              </div>
            )}
            {test.severity && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Şiddet</div>
                <Badge className={`${getSeverityColor(test.severity)} text-lg px-4 py-2`}>
                  {test.severity}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test-specific results */}
      {test.testType === "SCL_90" && renderSCL90Results()}
      {test.testType === "MMPI" && renderMMPIResults()}
      {test.testType === "OTOMATIK_DUSUNCELER" && renderOtomatikDusuncelerResults()}

      {/* Basic test results for Beck tests */}
      {(test.testType === "BECK_DEPRESSION" || test.testType === "BECK_ANXIETY") && (
        <Card>
          <CardHeader>
            <CardTitle>Test Sonuçları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <div className="text-6xl font-bold text-gray-900 mb-4">
                {test.totalScore}
              </div>
              <Badge className={`${getSeverityColor(test.severity)} text-xl px-6 py-3`}>
                {test.severity}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
