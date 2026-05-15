import React, { useState } from 'react';
import { FileUp, Trash2, Edit3, Printer, Layers, CheckSquare, Square, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

// 支店コード一覧
const BRANCH_DATA = {
  '001': { name: '札幌支店',     address: '〒061-3244 北海道石狩市新港南3丁目703-31',                    tel: '0133-64-6471' },
  '101': { name: '青森支店',     address: '〒038-0001 青森県青森市新田2丁目32-3',                        tel: '017-781-6471' },
  '102': { name: '八戸営業所',   address: '〒039-1103 青森県八戸市長苗代1-1-1',                          tel: '0178-21-3588' },
  '111': { name: '盛岡支店',     address: '〒020-0611 岩手県滝沢市巣子752-41',                           tel: '019-688-6471' },
  '121': { name: '秋田支店',     address: '〒010-1633 秋田県秋田市新屋鳥木町1-118',                      tel: '018-828-8551' },
  '131': { name: '仙台支店',     address: '〒983-0024 宮城県仙台市宮城野区鶴巻1-16-25',                  tel: '022-259-6471' },
  '141': { name: '山形支店',     address: '〒990-2161 山形県山形市漆山字南志田1631-4',                    tel: '023-686-6471' },
  '142': { name: '酒田営業所',   address: '〒998-0851 山形県酒田市東大町3丁目24-4',                      tel: '0234-22-6471' },
  '151': { name: '郡山支店',     address: '〒963-0204 福島県郡山市土瓜1丁目133-1',                       tel: '024-961-6471' },
  '153': { name: '福島営業所',   address: '〒960-1106 福島県福島市下鳥渡字三斗内4-1',                    tel: '024-593-0311' },
  '201': { name: '新潟支店',     address: '〒950-0811 新潟県新潟市東区材木町1-90',                       tel: '025-273-6471' },
  '202': { name: '長岡支店',     address: '〒940-2033 新潟県長岡市上除町甲188-2',                        tel: '0258-46-6471' },
  '203': { name: '上越営業所',   address: '〒943-0165 新潟県上越市大字上島449-1',                        tel: '025-525-6471' },
  '211': { name: '長野支店',     address: '〒381-0016 長野県長野市南堀618-1',                            tel: '026-244-6471' },
  '212': { name: '松本支店',     address: '〒390-0851 長野県松本市島内新橋3487-21',                      tel: '0263-47-6471' },
  '213': { name: '上田支店',     address: '〒386-0004 長野県上田市殿城976-5',                            tel: '0268-26-6471' },
  '214': { name: '軽井沢営業所', address: '〒389-0208 長野県北佐久郡御代田町茂沢森泉371-300',            tel: '0267-32-2400' },
  '221': { name: '富山支店',     address: '〒939-8213 富山県富山市黒瀬212-20',                           tel: '076-421-6471' },
  '231': { name: '金沢支店',     address: '〒921-8061 石川県金沢市森戸2丁目60-3',                        tel: '076-240-6471' },
  '241': { name: '福井支店',     address: '〒918-8105 福井県福井市木田1-3306',                           tel: '0776-34-6471' },
  '301': { name: '群馬支店',     address: '〒371-0857 群馬県前橋市高井町1丁目11-11',                     tel: '027-252-6471' },
  '311': { name: '水戸支店',     address: '〒310-0845 茨城県水戸市吉沢町178-1',                          tel: '029-247-6471' },
  '331': { name: '首都圏本部',   address: '〒101-0042 東京都千代田区神田東松下町17 フリージア本社ビル4F', tel: '03-6635-1782' },
  '401': { name: '名古屋支店',   address: '〒491-0838 愛知県一宮市猿海道2-1-16',                         tel: '0586-64-6471' },
  '501': { name: '関西本部',     address: '〒550-0001 大阪府茨木市郡5-30-13 新栄ビル10F',                tel: '072-641-6451' },
  '511': { name: '京滋出張所',   address: '〒520-3024 滋賀県栗東市小柿9-5-29',                           tel: '077-551-1356' },
  '601': { name: '広島支店',     address: '〒731-3167 広島県広島市安佐南区大塚西4-6-25',                  tel: '082-849-4771' },
  '611': { name: '岡山支店',     address: '〒701-0131 岡山県岡山市北区花尻みどり町3-101',                 tel: '086-214-6471' },
  '701': { name: '四国支店',     address: '〒792-0856 愛媛県新居浜市船木甲4370-1',                       tel: '0897-40-6471' },
  '801': { name: '福岡支店',     address: '〒816-0911 福岡県大野城市大城1-24-17',                        tel: '092-504-6471' },
  '802': { name: '鹿児島支店',   address: '〒891-0113 鹿児島県鹿児島市東谷山6丁目33-9',                  tel: '099-266-6471' },
};

export default function WaterproofWarrantyApp() {
  const [warrantyList, setWarrantyList] = useState([]);
  const [companyStamp, setCompanyStamp] = useState(null);
  const [printingId, setPrintingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const appTitle = "防水保証書作成アプリ";

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
            const branchCodeRaw = String(row[0] || '').trim();
            const branchCode = branchCodeRaw.padStart(3, '0');
            const branch = BRANCH_DATA[branchCode] || null;
            return {
              id: `id-${Date.now()}-${index}`,
              branchCode,
              branchName:    branch ? branch.name    : '',
              branchAddress: branch ? branch.address : '',
              branchTel:     branch ? branch.tel     : '',
              orderNo: row[4] || '',
              customerName: row[24] || row[7] || '',
              constructionAddress: row[27] || row[10] || '',
              constructionArea: 'ベランダ',
              constructionType: 'FRP防水工事',
              constructionMethod: '新築防水工事',
              completionDate: (() => {
                if (!rawDate) return '';
                const parts = rawDate.split('/');
                if (parts.length === 3) {
                  const [y, m, d] = parts;
                  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
                return rawDate.replace(/\//g, '-');
              })(),
              warrantyYears: '10',
            };
          }).filter(item => item.customerName !== "" || item.orderNo !== "");
          if (newWarranties.length > 0) setWarrantyList(prev => [...prev, ...newWarranties]);
        }
      });
    }
  };

  const handlePrint = (id) => {
    if (!companyStamp) return;
    if (id !== null && id !== 'selected') {
      const target = warrantyList.find(item => item.id === id);
      if (target) {
        const safeName = target.customerName.replace(/[\\/:*?"<>|]/g, "");
        document.title = `${safeName}様、${target.constructionMethod}保証書`;
      }
    } else if (id === 'selected') {
      document.title = `選択済み防水工事保証書一括`;
    } else {
      document.title = `防水工事保証書全件`;
    }
    setPrintingId(id);
    setTimeout(() => { window.print(); setPrintingId(null); document.title = appTitle; }, 200);
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const updateItem = (id, field, value) =>
    setWarrantyList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

  const calculateWarrantyPeriod = (date, years) => {
    if (!date) return '　';
    const start = new Date(date);
    if (isNaN(start.getTime())) return '　';
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + (parseInt(years) || 0));
    end.setDate(end.getDate() - 1);
    const fmt = (d) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return `${fmt(start)} 〜 ${fmt(end)}`;
  };

  const isTargetForPrint = (item) => {
    if (printingId === null) return true;
    if (printingId === 'selected') return selectedIds.has(item.id);
    return printingId === item.id;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white text-slate-800 font-sans">
      <div className="max-w-[1200px] mx-auto">

        {/* 操作パネル */}
        <div className="mb-8 grid lg:grid-cols-3 gap-6 print:hidden">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600"><FileUp size={20}/> データ読込</h2>
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                <span className="text-sm font-bold text-slate-600">CSVを選択 (Shift-JIS)</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
              <div className="pt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-600 mb-2 text-xs flex items-center gap-1">
                  {companyStamp ? <span className="text-green-600">● 角印登録済み</span> : <span className="text-red-500">● 角印未登録</span>}
                </label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { const r = new FileReader(); r.onload = (ev) => setCompanyStamp(ev.target.result); r.readAsDataURL(file); }
                }} className="text-[10px] w-full" />
              </div>
              {!companyStamp && (
                <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12}/> 印刷には角印の登録が必要です
                </p>
              )}
              <button onClick={() => handlePrint('selected')} disabled={selectedIds.size === 0 || !companyStamp}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <CheckSquare size={18}/> 選択した {selectedIds.size} 件を印刷
              </button>
              <button onClick={() => handlePrint(null)} disabled={warrantyList.length === 0 || !companyStamp}
                className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg shadow-md hover:bg-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <Layers size={18}/> まとめて全ページ印刷
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-500"><Edit3 size={20}/> 発行リスト</h2>
            <div className="overflow-y-auto max-h-[320px] space-y-2 pr-2">
              {warrantyList.length === 0 && <p className="text-slate-400 text-sm italic">CSVを読み込むと表示されます</p>}
              {warrantyList.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold">
                  <div className="flex items-center gap-3 truncate">
                    <button onClick={() => toggleSelect(item.id)}>
                      {selectedIds.has(item.id) ? <CheckSquare size={20} className="text-blue-600"/> : <Square size={20} className="text-slate-300"/>}
                    </button>
                    <span className="truncate">
                      #{idx+1} [№:{item.orderNo}] {item.customerName} 様 ({item.constructionMethod})
                      {item.branchName && <span className="ml-2 text-blue-600">／{item.branchName}</span>}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePrint(item.id)} disabled={!companyStamp}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-50 disabled:grayscale">
                      <Printer size={14}/> 個別印刷
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

        {/* 保証書プレビュー */}
        <div className="space-y-12 print:space-y-0">
          {warrantyList.map((item) => {
            if (!isTargetForPrint(item)) return null;
            return (
              <div key={item.id} className="warranty-page bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[12mm] flex flex-col justify-between box-border mx-auto relative mb-8 print:mb-0">
                <div className="border-[4px] border-double border-slate-900 p-[5mm] flex flex-grow flex-col justify-between relative">
                  <div className="absolute top-1 left-1 right-1 bottom-1 border border-slate-300 pointer-events-none"></div>

                  {/* ─── 上部コンテンツ ─── */}
                  <div>
                    {/* ヘッダー */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-40 text-[10px] font-bold text-slate-700">
                        №：<input type="text" value={item.orderNo} onChange={(e) => updateItem(item.id, 'orderNo', e.target.value)}
                          className="bg-transparent outline-none w-24 border-b border-slate-300" />
                      </div>
                      <div className="text-center flex-1">
                        <h1 className="text-3xl font-bold tracking-[0.4em] text-slate-900 mb-1 whitespace-nowrap">防水工事保証書</h1>
                        <div className="w-full h-1 bg-slate-900"></div>
                      </div>
                      <div className="w-40 flex justify-end relative">
                        {companyStamp && <img src={companyStamp} alt="社判" className="w-24 h-24 object-contain absolute top-0 z-10" />}
                      </div>
                    </div>

                    {/* 基本情報グリッド */}
                    <div className="grid grid-cols-2 gap-x-10 gap-y-3 mb-4">
                      <div className="border-b border-slate-400 pb-0.5">
                        <p className="text-[9px] text-slate-400 font-bold mb-0.5 tracking-wider uppercase">お客様名</p>
                        <div className="flex items-center">
                          <input type="text" value={item.customerName} onChange={(e) => updateItem(item.id, 'customerName', e.target.value)}
                            className="w-full text-[16px] bg-transparent outline-none font-bold" />
                          {item.customerName && <span className="text-xs font-bold ml-1">様</span>}
                        </div>
                      </div>
                      <div className="border-b border-slate-400 pb-0.5 min-h-[42px] flex flex-col justify-end">
                        <p className="text-[9px] text-slate-400 font-bold mb-0.5 tracking-wider uppercase">工事場所</p>
                        <textarea rows="2" value={item.constructionAddress} onChange={(e) => updateItem(item.id, 'constructionAddress', e.target.value)}
                          className="w-full text-[12px] bg-transparent outline-none font-bold resize-none leading-tight overflow-hidden" />
                      </div>
                      <div className="border-b border-slate-400 pb-0.5">
                        <p className="text-[9px] text-slate-400 font-bold mb-0.5 tracking-wider uppercase">施工箇所</p>
                        <input type="text" value={item.constructionArea} onChange={(e) => updateItem(item.id, 'constructionArea', e.target.value)}
                          className="w-full text-[12px] bg-transparent outline-none font-bold" />
                      </div>
                      <div className="border-b border-slate-400 pb-0.5">
                        <p className="text-[9px] text-slate-400 font-bold mb-0.5 tracking-wider uppercase">施工種別</p>
                        <input type="text" value={item.constructionType} onChange={(e) => updateItem(item.id, 'constructionType', e.target.value)}
                          className="w-full text-[12px] bg-transparent outline-none font-bold" />
                      </div>
                      <div className="border-b border-slate-400 pb-0.5">
                        <p className="text-[9px] text-slate-400 font-bold mb-0.5 tracking-wider uppercase">工事項目</p>
                        <select value={item.constructionMethod} onChange={(e) => updateItem(item.id, 'constructionMethod', e.target.value)}
                          className="w-full text-[12px] bg-transparent outline-none font-bold appearance-none cursor-pointer">
                          <option value="新築防水工事">新築防水工事</option>
                          <option value="防水改修工事">防水改修工事</option>
                        </select>
                      </div>
                      <div className="border-b border-slate-400 pb-0.5">
                        <p className="text-[9px] text-slate-400 font-bold mb-0.5 tracking-wider uppercase">施工完了日</p>
                        <input type="date" value={item.completionDate} onChange={(e) => updateItem(item.id, 'completionDate', e.target.value)}
                          className="w-full text-[12px] bg-transparent outline-none font-bold" />
                      </div>
                    </div>

                    {/* 保証期間 */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg py-3 px-4 mb-4 text-center">
                      <p className="text-[10px] font-bold text-slate-500 mb-0.5 tracking-[0.2em] uppercase">Waterproof Warranty Period</p>
                      <p className="text-xl font-bold text-slate-900">{calculateWarrantyPeriod(item.completionDate, item.warrantyYears)}</p>
                      <div className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center justify-center">
                        (施工完了日より満
                        <input type="number" value={item.warrantyYears} onChange={(e) => updateItem(item.id, 'warrantyYears', e.target.value)}
                          className="w-10 text-center bg-transparent border-b border-slate-400 mx-1 outline-none font-bold" />
                        年間保証)
                      </div>
                    </div>

                    {/* 保証内容・免責・その他 */}
                    <div className="space-y-2 px-2 text-slate-800">
                      <section>
                        <h3 className="font-bold text-[11px] mb-1 border-l-4 border-slate-900 pl-2 bg-slate-100 py-0.5">〈保障の内容〉</h3>
                        <p className="text-[11px] ml-3 leading-snug">保証期間中、万一施工に起因する漏水が発生した場合、防水層の補修を致します。</p>
                      </section>
                      <section>
                        <h3 className="font-bold text-[11px] mb-1 border-l-4 border-slate-900 pl-2 bg-slate-100 py-0.5">〈免責事項〉</h3>
                        <div className="grid grid-cols-1 gap-y-0 text-[10.5px] ml-3 leading-snug">
                          <p>① 天災地変及び故意の損傷による事故。</p>
                          <p>② 下地躯体構造に起因する事故。</p>
                          <p>③ 防水工事施工後の、配管その他の工事等に起因する事故。</p>
                          <p>④ 当該仕様と異なった条件下の施工に起因する事故。</p>
                          <p>⑤ 当該施工部位以外での発生事故に起因する事故。</p>
                          <p>⑥ 本来の用途以外の仕様に起因する事故。</p>
                          <p>⑦ 施工者以外の施工作業に起因する事故。</p>
                          <p>⑧ 記載の防水標準仕様と著しく異なる仕様の場合。</p>
                          <p>⑨ 施工者の状況確認無しに修繕、補修がなされていた場合。</p>
                        </div>
                      </section>
                      <section>
                        <h3 className="font-bold text-[11px] mb-1 border-l-4 border-slate-900 pl-2 bg-slate-100 py-0.5">〈その他〉</h3>
                        <p className="text-[11px] ml-3">トップコートは、5年ごとを目安に定期点検を推奨いたします。</p>
                      </section>
                    </div>
                  </div>

                  {/* ─── 下部コンテンツ ─── */}
                  <div className="mt-auto">
                    {/* 標準仕様 */}
                    <div className="border-2 border-slate-300 px-4 py-2 bg-white mb-2 rounded-md">
                      <h4 className="text-[10.5px] font-bold text-center mb-1 border-b-2 pb-1 text-slate-800 tracking-widest uppercase">ピコイFRP防水標準仕様</h4>
                      <div className="grid grid-cols-1 gap-y-0.5 text-[9.5px] text-slate-600 leading-snug px-1">
                        <p><span className="font-bold text-slate-800">(1)</span> 床の勾配は1/50以上とする。</p>
                        <p><span className="font-bold text-slate-800">(2)</span> 下地の合板は耐水合板(T1)厚み12m/mの2枚張りとする。(防火地域内は防火板厚み12m/mを張る)</p>
                        <p><span className="font-bold text-slate-800">(3)</span> 根太間隔は300m/m以下とする。</p>
                        <p><span className="font-bold text-slate-800">(4)</span> 下張りと上張りの合板及び上張り防火板の目地は重ならないように張る。</p>
                        <p><span className="font-bold text-slate-800">(5)</span> 防水層の立上り高さは、開口部の下端で120m/m以上、その他の立上りは250m/m以上とする。</p>
                        <p><span className="font-bold text-slate-800">(6)</span> FRP防水はガラスマット積層を、下地に2枚貼りとし、他は工法仕様に準ずるものとする。</p>
                        <p><span className="font-bold text-slate-800">(7)</span> 排水ドレンはFRP製を基準とする。</p>
                        <p><span className="font-bold text-slate-800">(8)</span> 根太を用いず直接、床下地板を張る場合、木造住宅工事仕様書(2005年改訂)5.8.7-6項目に準じる。</p>
                        <p><span className="font-bold text-slate-800">(9)</span> 特殊部分の納まりは標準仕様に該当しないためその部分は保証対象外とする。</p>
                      </div>
                    </div>

                    {/* 支店情報（全項目編集可能・コード一致時のみ表示） */}
                    {(item.branchName || item.branchAddress || item.branchTel) && (
                      <div className="border border-slate-300 rounded px-3 py-1.5 mb-2 bg-slate-50 grid grid-cols-3 gap-x-3 items-center">
                        <div>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">施工支店</p>
                          <input type="text" value={item.branchName}
                            onChange={(e) => updateItem(item.id, 'branchName', e.target.value)}
                            className="w-full text-[10px] font-bold bg-transparent outline-none border-b border-slate-300" />
                        </div>
                        <div>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">住所</p>
                          <input type="text" value={item.branchAddress}
                            onChange={(e) => updateItem(item.id, 'branchAddress', e.target.value)}
                            className="w-full text-[9px] bg-transparent outline-none border-b border-slate-300" />
                        </div>
                        <div>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">TEL</p>
                          <input type="text" value={item.branchTel}
                            onChange={(e) => updateItem(item.id, 'branchTel', e.target.value)}
                            className="w-full text-[10px] bg-transparent outline-none border-b border-slate-300" />
                        </div>
                      </div>
                    )}

                    {/* フッター */}
                    <div className="flex justify-between items-end border-t-4 border-slate-900 pt-3 px-2">
                      <p className="text-[15px] font-bold tracking-[0.3em] text-slate-900">上記の通り, 保証いたします。</p>
                      <p className="text-[10px] text-slate-800 font-bold italic">
                        発行日：{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media screen {
          .warranty-page { margin-bottom: 50px; }
        }
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hidden, .print\\:hidden { display: none !important; }
          .warranty-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 12mm !important;
            page-break-after: always;
            page-break-inside: avoid;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            display: flex !important;
          }
          input, select, textarea {
            border: none !important;
            outline: none !important;
            background: transparent !important;
            appearance: none !important;
            -webkit-appearance: none !important;
          }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .bg-slate-100 { background-color: #f1f5f9 !important; }
        }
      `}</style>
    </div>
  );
}