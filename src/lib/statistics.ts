export type FrequencyRow={label:string;lower:number;upper:number;mark:number;absolute:number;cumulative:number;relative:number;percent:number}
export type RegressionPoint={x:number;y:number;estimate:number;residual:number}
export type StatisticsReport={n:number;mean:number;median:number;modes:number[];min:number;max:number;range:number;populationVariance:number;sampleVariance:number|null;populationSd:number;sampleSd:number|null;cv:number|null;q1:number;q2:number;q3:number;deciles:number[];percentiles:number[];skewness:number|null;kurtosis:number|null;excessKurtosis:number|null;frequency:FrequencyRow[]}
const valid=(values:number[])=>values.length>0&&values.every(Number.isFinite)
const quantile=(sorted:number[],p:number)=>{const i=(sorted.length-1)*p,l=Math.floor(i),u=Math.ceil(i);return sorted[l]+(sorted[u]-sorted[l])*(i-l)}
export function descriptiveStatistics(values:number[], bins?:number):StatisticsReport{
 if(!valid(values))throw Error('Ingresa al menos un dato numérico válido.')
 const a=[...values].sort((x,y)=>x-y),n=a.length,mean=values.reduce((s,x)=>s+x,0)/n
 const sq=values.reduce((s,x)=>s+(x-mean)**2,0),pv=sq/n,sv=n>1?sq/(n-1):null,ps=Math.sqrt(pv),ss=sv===null?null:Math.sqrt(sv)
 const counts=new Map<number,number>(); values.forEach(x=>counts.set(x,(counts.get(x)||0)+1));const high=Math.max(...counts.values());const modes=high===1?[]:[...counts].filter(([,c])=>c===high).map(([x])=>x)
 const skew=n<3||ps===0?null:values.reduce((s,x)=>s+((x-mean)/ps)**3,0)/n
 const kurt=n<4||ps===0?null:values.reduce((s,x)=>s+((x-mean)/ps)**4,0)/n
 const frequency=frequencyTable(values,bins)
 return {n,mean,median:quantile(a,.5),modes,min:a[0],max:a[n-1],range:a[n-1]-a[0],populationVariance:pv,sampleVariance:sv,populationSd:ps,sampleSd:ss,cv:ss===null||mean===0?null:ss/Math.abs(mean),q1:quantile(a,.25),q2:quantile(a,.5),q3:quantile(a,.75),deciles:Array.from({length:9},(_,i)=>quantile(a,(i+1)/10)),percentiles:Array.from({length:99},(_,i)=>quantile(a,(i+1)/100)),skewness:skew,kurtosis:kurt,excessKurtosis:kurt===null?null:kurt-3,frequency}
}
export function frequencyTable(values:number[], requestedBins?:number):FrequencyRow[]{
 if(!valid(values))throw Error('Ingresa datos numéricos válidos.')
 const min=Math.min(...values),max=Math.max(...values),n=values.length
 if(min===max)return[{label:String(min),lower:min,upper:max,mark:min,absolute:n,cumulative:n,relative:1,percent:100}]
 const rawBins=requestedBins??Math.ceil(Math.sqrt(n));if(!Number.isFinite(rawBins)||rawBins<1)throw Error('El número de clases debe ser un entero entre 1 y 30.')
 const bins=Math.max(1,Math.min(30,Math.floor(rawBins)))
 const width=(max-min)/bins;let cumulative=0
 return Array.from({length:bins},(_,i)=>{const lower=min+i*width,upper=i===bins-1?max:min+(i+1)*width,absolute=values.filter(x=>i===bins-1?x>=lower&&x<=upper:x>=lower&&x<upper).length;cumulative+=absolute;return{label:`${fmt(lower)} – ${fmt(upper)}${i===bins-1?'':')'}`,lower,upper,mark:(lower+upper)/2,absolute,cumulative,relative:absolute/n,percent:absolute/n*100}})
}
export function correlationRegression(pairs:{x:number;y:number}[]){
 if(pairs.length<2||pairs.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw Error('Ingresa al menos dos pares numéricos X,Y.')
 const n=pairs.length,mx=pairs.reduce((s,p)=>s+p.x,0)/n,my=pairs.reduce((s,p)=>s+p.y,0)/n
 const sxx=pairs.reduce((s,p)=>s+(p.x-mx)**2,0),syy=pairs.reduce((s,p)=>s+(p.y-my)**2,0),sxy=pairs.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)
 if(sxx===0||syy===0)throw Error('X e Y deben variar para calcular correlación y regresión.')
 const covariance=sxy/(n-1),pearson=sxy/Math.sqrt(sxx*syy),slope=sxy/sxx,intercept=my-slope*mx
 const points:RegressionPoint[]=pairs.map(p=>{const estimate=intercept+slope*p.x;return{...p,estimate,residual:p.y-estimate}})
 return{n,meanX:mx,meanY:my,covariance,pearson,r2:pearson**2,slope,intercept,points}
}
export const normalCdf=(z:number)=>{const t=1/(1+.2316419*Math.abs(z));const d=.3989423*Math.exp(-z*z/2);const p=1-d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>=0?p:1-p}
export const fmt=(n:number)=>new Intl.NumberFormat('es-BO',{maximumFractionDigits:4}).format(n)
