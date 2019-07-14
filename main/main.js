'use strict';

//decodeBarcode tags to get the count and barcode of item
const decodeBarcodes=tags=>{
    let barcoeds=tags.map(tag=>(tag.indexOf('-')>-1)?tag.substring(0,tag.indexOf('-')):tag);
    let count=tags.map(tag=>(tag.indexOf('-')>-1)?parseFloat(tag.substring(tag.indexOf('-')+1,tag.length)):1);
    let decodeBarcodes=new Array();
    for (let i=0;i<tags.length;i++){
        let tempCount=count[i];
        while(barcoeds[i]==barcoeds[i+1]&&i<barcoeds.length-1){
            tempCount+=count[i+1];
            i++;
        }
        let barcodeAndCount=new Object();
        barcodeAndCount.barcode=barcoeds[i];
        barcodeAndCount.count=tempCount;
        decodeBarcodes.push(barcodeAndCount);
    }
    return decodeBarcodes;
}

//Link the number of items to the item information
const combineItems=(itemsWithoutCount,decodeBarcodes)=>{
    let items=decodeBarcodes.slice();
    for (var i=0;i<itemsWithoutCount.length;i++){
        for (var j=0;j<decodeBarcodes.length;j++){
            if(itemsWithoutCount[i].barcode==decodeBarcodes[j].barcode){
                items[j].name=itemsWithoutCount[i].name;
                items[j].price=itemsWithoutCount[i].price;
                items[j]. unit=itemsWithoutCount[i]. unit;
            }
        }
    }

    return items;
}
const decodeTags=tags=>{
    let items=combineItems(loadAllItems(),decodeBarcodes(tags));
    return items;
}
//Calculate the total price of the item after deduction
const promoteReceiptItems=(items,promotions)=>{
    let promotionBarcodes=promotions[0].barcodes;
    let receiptItems=items.concat();
    receiptItems.forEach(function countSubtoal(i) {
        i.subtotal=(promotionBarcodes.indexOf(i.barcode)>-1)?
            i.price*(i.count-Math.floor(i.count/3.0)):i.price*i.count});
    return receiptItems;
}
const calculateReceiptItems=(items)=>{
    let promotions=loadPromotions();
    return promoteReceiptItems(items,promotions);
}
//Calculate the total price of all items after deduction
const calculateReceiptTotal=receiptItems=>{
    let total=0;
    for (let i=0;i<receiptItems.length;i++){total+=receiptItems[i].subtotal;}
    return total;
}
//Calculate the total price of all items after deduction
const calculateReceiptSaving=receiptItems=>{
    let saving=0;
    let totalBefore=0;
    let total=calculateReceiptTotal(receiptItems);
    for (let i=0;i<receiptItems.length;i++){
        totalBefore+=receiptItems[i].count*receiptItems[i].price;
    }
    saving=totalBefore-total;
    return saving;
}
const calculateReceipt=receiptItems=>{
    let receipt=new Array();
    let saving=calculateReceiptSaving(receiptItems);
    let total=calculateReceiptTotal(receiptItems);
    receipt.push(receiptItems);
    receipt.push(total);
    receipt.push(saving);
    return receipt;
}
const renderReceipt=receipt=>{
    let renderedReceipt= `***<没钱赚商店>收据***`;
    let receiptItems=receipt[0];
    for (let i=0;i<receiptItems.length;i++){
        renderedReceipt+=`
名称：${receiptItems[i].name}，数量：${receiptItems[i].count}${receiptItems[i].unit}，单价：${receiptItems[i].price.toFixed(2)}(元)，小计：${receiptItems[i].subtotal.toFixed(2)}(元)`;
    }
    renderedReceipt+=`
----------------------
总计：${receipt[1].toFixed(2)}(元)
节省：${receipt[2].toFixed(2)}(元)
**********************`;
    return renderedReceipt;
}
const printReceipt=tags=>{
    let items=decodeTags(tags);
    let receiptItems=calculateReceiptItems(items);
    let receipt=calculateReceipt(receiptItems);
    let renderedReceipt=renderReceipt(receipt);
    console.log(renderedReceipt);
}