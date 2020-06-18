// ==UserScript==
// @name         YZU Portal Auto Login
// @version      1.2
// @description  Login to YZU's protal automatically.
// @author       Jian Feng Lin | https://github.com/Rannddyyy
// @match        https://portalx.yzu.edu.tw/PortalSocialVB/Login.aspx
// @require      https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js
// @require      https://www.marvinj.org/releases/marvinj-1.0.min.js
// @require      http://html2canvas.hertzen.com/dist/html2canvas.min.js
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Rannddyyy/YZUPortalAutoLogin/master/userscript.js
// @downloadURL  https://raw.githubusercontent.com/Rannddyyy/YZUPortalAutoLogin/master/userscript.js
// ==/UserScript==
(function() {
    'use strict';

    //document.getElementById("Txt_UserID").value = 'yourStdID';
    //document.getElementById("Txt_Password").value = 'yourPWD';

    const worker = Tesseract.createWorker();
    let initWorker = false;
    let listener = false;

    function OCR(imgTag) {
        // html2canvas is a screenshot api, prevent image.load will load from cache
        html2canvas(imgTag).then(canvas => canvas.toBlob((blob) => {
            let blobImg = URL.createObjectURL(blob);
            let image = new MarvinImage()
            image.load(blobImg, function() {
                var imageOut = new MarvinImage(image.getWidth(), image.getHeight());
                Marvin.thresholding(image, imageOut, 115);
                Marvin.gaussianBlur(imageOut, imageOut, 3.0);
                Marvin.thresholding(imageOut, imageOut, 150);

                new Promise(function (resolve, reject) {
                    return resolve(worker.recognize(imageOut.toBlob()));
                }).then((jsonObj)=>{
                    //console.log(jsonObj['data']['text']);
                    document.getElementById('Txt_VeriCode').value = jsonObj['data']['text'];
                    document.getElementById("ibnSubmit").click();
                    imgTag.setAttribute('src', blobImg);
                });

            });
        }));
    }

    document.onreadystatechange = function () {
        if(listener) return;
        if (document.readyState == "complete") {
            new Promise((resolve)=>{
                let x = setInterval(()=>{
                    if(initWorker) {
                        clearInterval(x);
                        resolve();
                    }
                    //else console.log('initting');
                }, 10);
            }).then(()=>{
                document.getElementById('VeriCodePage').addEventListener("load", (evt)=>{
                    OCR(document.getElementById('VeriCodePage').contentDocument.getElementsByTagName('img')[0])
                })
                if(document.getElementById('Txt_VeriCode').value == '') { // first time may not trigger iframe load
                    OCR(document.getElementById('VeriCodePage').contentDocument.getElementsByTagName('img')[0])
                }
            });
            listener = true;
        }
    }

    ~async function(){
        if(initWorker) { return true; }
        //console.log('init');
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        initWorker = true;
        //console.log('init done')
    }();
})();
