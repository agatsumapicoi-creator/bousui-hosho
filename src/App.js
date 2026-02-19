import React, { useState } from 'react';
import { FileUp, Trash2, Edit3, Printer, Layers, CheckSquare, Square } from 'lucide-react';
import Papa from 'papaparse';

export default function WaterproofWarrantyApp() {
  const [warrantyList, setWarrantyList] = useState([]);
  const [companyStamp, setCompanyStamp] = useState(null);
  const [printingId, setPrintingId] = useState(null); 
  const [selectedIds, setSelectedIds] = useState(new Set());

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        encoding: "SJIS", 
        header: false, 
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;
          if (rows.length < 2) return;
          const newWarranties = rows.slice(1).map((row, index) => {
            const rawDate = row[3] || '';
            return {
              id: `id-${Date.now()}-${index}`,
              orderNo: row[4] || '', 
              customerName: row[24] || row[7] || '', 
              constructionAddress: row[27] || row[10] || '', 
              constructionArea: 'ベランダ',
              constructionType: 'FRP防水',
              constructionMethod: 'FRP',
              completionDate: rawDate.replace(/\//g, '-'), 
              warrantyYears: '5' 
            };
          }).filter(item => item.customerName !== "" || item.orderNo !== "");
          if (newWarranties.length > 0) setWarrantyList([...warrantyList, ...newWarranties]);
        }
      });
    }
  };

  // ★ 改善ポイント: 印刷が終わったら printingId を確実に戻す
  const handlePrint = (id) => {
    setPrintingId(id);
    // レンダリングが完了するのを待ってから印刷
    setTimeout(() => {
      window.print();
      setPrintingId(null);
    }, 200);
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const updateItem = (id, field, value) => {
    setWarrantyList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateWarrantyPeriod = (date, years) => {
    if (!date) return '　';
    const start = new Date(date);
    if (isNaN(start.getTime())) return '　';
    const end = new Date(start);
    const y = parseInt(years) || 0;
    end.setFullYear(end.getFullYear() + y);
    end.setDate(end.getDate() - 1); 
    const fmt = (d) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return `${fmt(start)} 〜 ${fmt(end)}`;
  };

  // ★ 印刷対象かどうかを判定する関数
  const isTargetForPrint = (item) => {
    if (printingId === null) return true; // 全件印刷
    if (printingId === 'selected') return selectedIds.has(item.id); // 選択印刷
    return printingId === item.id; // 個別印刷
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white text-slate-800 font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        {/* 操作パネル（印刷時は非表示） */}
        <div className="mb-8 grid lg:grid-cols-3 gap-6 print:hidden">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600"><FileUp size={20}/> データ読込</h2>
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                <span className="text-sm font-bold text-slate-600">CSVを選択 (Shift-JIS)</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
              <div className="pt-2 text-xs">
                <label className="block font-bold text-slate-500 mb-1 text-[10px]">社判（角印）の登録</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setCompanyStamp(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }} className="w-full" />
              </div>
              <button 
                onClick={() => handlePrint('selected')}
                disabled={selectedIds.size === 0}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <CheckSquare size={18}/> 選択した {selectedIds.size} 件を保存
              </button>
              <button 
                onClick={() => handlePrint(null)}
                disabled={warrantyList.length === 0}
                className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg shadow-md hover:bg-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <Layers size={18}/> まとめて全ページ印刷
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-500"><Edit3 size={20}/> 発行リスト</h2>
            <div className="overflow-y-auto max-h-[250px] space-y-2 pr-2">
              {warrantyList.length === 0 && <p className="text-slate-400 text-sm italic">CSVを読み込むとここに表示されます</p>}
              {warrantyList.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold">
                  <div className="flex items-center gap-3 truncate">
                    <button onClick={() => toggleSelect(item.id)}>
                      {selectedIds.has(item.id) ? <CheckSquare size={20} className="text-blue-600"/> : <Square size={20} className="text-slate-300"/>}
                    </button>
                    <span className="truncate">#{idx+1} [№:{item.orderNo}] {item.customerName} 様</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePrint(item.id)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded flex items-center gap-2">
                      <Printer size={14}/> 個別PDF
                    </button>
                    <button onClick={() => setWarrantyList(warrantyList.filter(i => i.id !== item.id))} className="text-red-400 p-1 hover:text-red-600">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* プレビュー表示エリア */}
        <div className="space-y-12 print:space-y-0">
          {warrantyList.map((item) => {
            // ★ ここが最重要：印刷対象外のデータは DOM（HTML）に描き出さない
            if (!isTargetForPrint(item)) return null;

            return (
              <div 
                key={item.id} 
                className="warranty-page bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[12mm] flex flex-col justify-between box-border mx-auto relative"
              >
                <div className="border-[4px] border-double border-slate-900 p-[6mm] flex flex-grow flex-col justify-between relative">
                  <div className="absolute top-1 left-1 right-1 bottom-1 border border-slate-300 pointer-events-none"></div>
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-40 text-[10px] font-bold">№：<input type="text" value={item.orderNo} onChange={(e) => updateItem(item.id, 'orderNo', e.target.value)} className="bg-transparent outline-none w-24 border-b border-slate-200" /></div>
                      <div className="text-center flex-1">
                        <h1 className="text-3xl font-bold tracking-[0.4em] text-slate-900 mb-1 whitespace-nowrap">防水工事保証書</h1>
                        <div className="w-full h-1 bg-slate-900"></div>
                      </div>
                      <div className="w-40 flex justify-end relative">
                        {companyStamp && <img src={companyStamp} alt="社判" className="w-24 h-24 object-contain absolute top-0 z-10" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-6">
                      {[
                        { label: 'お客様名', field: 'customerName', value: item.customerName },
                        { label: '工事場所', field: 'constructionAddress', value: item.constructionAddress },
                        { label: '施工箇所', field: 'constructionArea', value: item.constructionArea },
                        { label: '施工種別', field: 'constructionType', value: item.constructionType },
                        { label: '工法名', field: 'constructionMethod', value: item.constructionMethod },
                        { label: '施工完了日', field: 'completionDate', value: item.completionDate, type: 'date' }
                      ].map((cell) => (
                        <div key={cell.field} className="border-b border-slate-400 pb-0.5">
                          <p className="text-[9px] text-slate-400 font-bold mb-0.5 tracking-wider uppercase">{cell.label}</p>
                          <div className="flex items-center">
                            <input type={cell.type || "text"} value={cell.value} onChange={(e) => updateItem(item.id, cell.field, e.target.value)} className={`w-full text-[12px] bg-transparent outline-none font-bold ${cell.field === 'customerName' ? 'text-[16px]' : ''}`} />
                            {cell.field === 'customerName' && cell.value && <span className="text-xs font-bold ml-1">様</span>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg py-4 px-4 mb-6 text-center">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 tracking-[0.2em] uppercase">Waterproof Warranty Period</p>
                      <p className="text-xl font-bold text-slate-900">{calculateWarrantyPeriod(item.completionDate, item.warrantyYears)}</p>
                      <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center justify-center">
                        (施工完了日より満 <input type="number" value={item.warrantyYears} onChange={(e)=>updateItem(item.id, 'warrantyYears', e.target.value)} className="w-8 text-center bg-transparent border-b border-slate-400 mx-1 outline-none" /> 年間保証)
                      </div>
                    </div>

                    <div className="space-y-4 px-2">
                      <section>
                        <h3 className="font-bold text-[11px] mb-1.5 border-l-4 border-slate-900 pl-2 bg-slate-100 py-0.5">〈保障の内容〉</h3>
                        <p className="text-[11px] text-slate-700 ml-3">保証期間中、万一施工に起因する漏水が発生した場合、防水層の補修を致します。</p>
                      </section>
                      <section>
                        <h3 className="font-bold text-[11px] mb-1.5 border-l-4 border-slate-900 pl-2 bg-slate-100 py-0.5">〈免責事項〉</h3>
                        <div className="grid grid-cols-1 gap-y-0.5 text-[10.5px] text-slate-700 ml-3 leading-snug">
                          <p>① 天災地変及び故意の損傷による事故。</p>
                          <p>② 下地躯体構造に起因する事故。</p>
                          <p>③ 防水工事施工後の、配管その他の工事等に起因する事故。</p>
                          <p>④ 当該仕様と異なった条件下の施工に起因する事故。</p>
                          <p>⑤ 当該施工部位以外での発生事故に起因する事故。</p>
                          <p>⑥ 本来の用途以外の仕様に起因する事故。</p>
                          <p>⑦ 施工者以外の施工作業に起因する事故。</p>
                          <p>⑧ 記載の防水標準仕様と著しく異なる仕様の場合。</p>
                        </div>
                      </section>
                      <section>
                        <h3 className="font-bold text-[11px] mb-1.5 border-l-4 border-slate-900 pl-2 bg-slate-100 py-0.5">〈その他〉</h3>
                        <p className="text-[11px] text-slate-700 ml-3">トップコートは5年ごとに点検し、再塗装(有償)を実施して下さい。</p>
                      </section>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="border-2 border-slate-300 p-4 bg-white mb-4 rounded-md">
                      <h4 className="text-[10.5px] font-bold text-center mb-3 border-b-2 pb-1 text-slate-800 tracking-widest uppercase">ピコイFRP防水標準仕様</h4>
                      <div className="grid grid-cols-1 gap-y-1.5 text-[9.5px] text-slate-600 leading-[1.5] px-1">
                        <p><span className="font-bold text-slate-800">(1)</span> 床の勾配は1/50以上とする。</p>
                        <p><span className="font-bold text-slate-800">(2)</span> 下地の合板は耐水合板(T1)厚み12m/mの2枚張りとする。(防火地域内は防火板厚み12m/mを張る)</p>
                        <p><span className="font-bold text-slate-800">(3)</span> 根太間隔は300m/m以下とする。</p>
                        <p><span className="font-bold text-slate-800">(4)</span> 下張りと上張りの合板及び上張り防火板の目地は重ならないように張る。</p>
                        <p><span className="font-bold text-slate-800">(5)</span> 防火層の立上り高さは、開口部の下端で120m/m以上、それ以下の部分は250m/m以上とする。</p>
                        <p><span className="font-bold text-slate-800">(6)</span> FRP防水はガラスマット積層を、木下地2PLYとし、他は工法仕様に準ずるものとする。</p>
                        <p><span className="font-bold text-slate-800">(7)</span> 排水ドレンはDP-1Bを標準仕様とする。</p>
                        <p><span className="font-bold text-slate-800">(8)</span> 根太を用いず直接、床下地板を張る場合、木造住宅工事仕様書(2005年改訂)5.8.7-6項目に準じる。</p>
                        <p><span className="font-bold text-slate-800">(9)</span> 特殊部の納まりが適切なものとする。</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-t-4 border-slate-900 pt-4 px-2">
                      <p className="text-[15px] font-bold tracking-[0.3em] text-slate-900">上記の通り、保証いたします。</p>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-800 font-bold italic">発行日：{new Date().toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .print-hidden, .print\\:hidden { display: none !important; }
          
          .warranty-page {
            box-shadow: none !important; margin: 0 !important; padding: 12mm !important;
            page-break-after: always; width: 210mm !important; height: 297mm !important;
            display: flex !important;
          }
          input { border: none !important; outline: none !important; background: transparent !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .bg-slate-100 { background-color: #f1f5f9 !important; }
        }
      `}</style>
    </div>
  );
}