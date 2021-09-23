async function replaceUSDWithETH() {
    // load price from coingecko
    const data = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=krw"
    ).then((response) => response.json());
    const etherPrice = data.ethereum.krw;

    // replace simple dollar amounts
    // const simpleDollarRegex = /\${1}(\d+(,\d{3})*(\.[0-9]*)?)/g;
    const simpleDollarRegex = /(\d+(,\d{3})*(\.[0-9]*)?)원{1}/g
    document.body.innerHTML = document.body.innerHTML.replace(
        simpleDollarRegex,
        (match, rawDollarAmount) => {
            const dollarAmount = +rawDollarAmount.replace(/\,/g, "");
            const ethAmount = dollarAmount / etherPrice;
            return `${ethAmount.toLocaleString("en-US", {
                maximumFractionDigits: 4,
            })} ETH`;
        }
    );

    // replace cases where the dollar sign, whole price, and fraction price are in different spans
    const threeSpanRegex =
        /<span (.*?)>\$<\/span><span (.*?)>(\d+(,\d{3})*)<span (.*?)>\.<\/span><\/span><span (.*?)>([0-9]*)<\/span>/g;
    document.body.innerHTML = document.body.innerHTML.replace(
        threeSpanRegex,
        (
            match,
            attrs1,
            attrs2,
            rawWholeDollarAmount,
            _,
            attrs3,
            attrs4,
            rawFractionalDollarAmount
        ) => {
            const wholeDollarAmount = +rawWholeDollarAmount.replace(/\,/g, "");
            const fractionalDollarAmount = +`0.${rawFractionalDollarAmount}`;
            const dollarAmount = wholeDollarAmount + fractionalDollarAmount;
            const ethAmount = dollarAmount / etherPrice;
            const wholeEthAmount = Math.floor(ethAmount);
            const fractionalEthAmount = ethAmount - wholeEthAmount;
            return `<span ${attrs1}>ETH</span><span ${attrs2}>${wholeEthAmount.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 0,
                }
            )}<span ${attrs3}>.</span></span><span ${attrs4}>${fractionalEthAmount
                .toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                })
                .substr(2)}</span>`;
        }
    );

    // replace cases where the dollar sign is in a separate span
    // const separateSpanRegex =
    //     /<span (.*?)>\$<\/span>\s*<span (.*?)>(\d+(,\d{3})*(\.[0-9]*)?)<\/span>/g;
    const separateSpanRegex = /<span (.*?)>(\d+(,\d{3})*(\.[0-9]*)?)<\/span>\s*<span (.*?)>\원<\/span>/g
    document.body.innerHTML = document.body.innerHTML.replace(
        separateSpanRegex,
        (match, attrs1, rawDollarAmount, attrs2, attrs3, attrs5 ) => {
            const dollarAmount = +rawDollarAmount.replace(/\,/g, "");
            const ethAmount = dollarAmount / etherPrice;
            return `<span ${attrs5}>ETH</span><span ${attrs1}>${ethAmount.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 4,
                }
            )}</span>`;
        }
    );

    //replace money in Coupang search list.
    const cpngListSpanRegex = /<strong (.*?)>(\d+(,\d{3})*(\.[0-9]*)?)<\/strong>\s*\원/g
    document.body.innerHTML = document.body.innerHTML.replace(
        cpngListSpanRegex,
        (match, attrs1, rawDollarAmount ) => {
            const dollarAmount = +rawDollarAmount.replace(/\,/g, "");
            const ethAmount = dollarAmount / etherPrice;
            return `<span>ETH</span><span ${attrs1}>${ethAmount.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 4,
                }
            )}</span>`;
        }
    );

    //replace money in Coupang product page.
    const cpngPrdSpanRegex = /<strong>(\d+(,\d{3})*(\.[0-9]*)?)\s*<span (.*?)>\원<\/span><\/strong>/g
    document.body.innerHTML = document.body.innerHTML.replace(
        cpngPrdSpanRegex,
        (match, rawDollarAmount, attrs1 ) => {
            const dollarAmount = +rawDollarAmount.replace(/\,/g, "");
            const ethAmount = dollarAmount / etherPrice;
            return `<span>ETH</span><span ${attrs1}>${ethAmount.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 4,
                }
            )}</span>`;
        }
    );

    //replace money in Naver auto page.
    const naverAutoSpanRegex = /<span (.*?)>(\d+(,\d{3})*(\.[0-9]*)?)\~(\d+(,\d{3})*(\.[0-9]*)?)<\/span>\s*<span (.*?)>\만원<\/span>/g
    document.body.innerHTML = document.body.innerHTML.replace(
        naverAutoSpanRegex,
        (match, attrs1, rawDollarAmountFirst, attrs2, attrs3, rawDollarAmountTwo, attrs5, attrs6, attrs8 ) => {
            const dollarAmountFirst = +rawDollarAmountFirst.replace(/\,/g, "");
            const ethAmountFirst = (dollarAmountFirst*10000) / etherPrice;
            const dollarAmountTwo = +rawDollarAmountTwo.replace(/\,/g, "");
            const ethAmountTwo = (dollarAmountTwo*10000) / etherPrice;
            return `<span ${attrs8}>ETH</span><span ${attrs1}>${ethAmountFirst.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 4,
                }
            )}~${ethAmountTwo.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 4,
                }
            )}</span>`;
        }
    );
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status == "complete" && tab.active) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: replaceUSDWithETH,
        });
    }
});
