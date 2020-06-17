// ==UserScript==
// @name         YZU Portal Auto Login
// @version      1.0
// @description  Login to YZU's protal automatically.
// @author       Jian Feng Lin | https://github.com/Rannddyyy
// @match        https://portalx.yzu.edu.tw/PortalSocialVB/Login.aspx
// @require      https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js
// @require      https://www.marvinj.org/releases/marvinj-1.0.min.js
// ==/UserScript==
(function() {
    'use strict';

    document.getElementById("Txt_UserID").value = 'yourStdID';
    document.getElementById("Txt_Password").value = 'yourPWD';

    function OCR() {
        var image = new MarvinImage();
        image.load('https://portalx.yzu.edu.tw/PortalSocialVB/SelRandomImage.aspx', function() {
            var imageOut = new MarvinImage(image.getWidth(), image.getHeight());
            Marvin.thresholding(image, imageOut, 115);
            Marvin.gaussianBlur(imageOut, imageOut, 3.0);
            Marvin.thresholding(imageOut, imageOut, 150);
            var tesseract = Tesseract;
            (async () => {
                const worker = tesseract.createWorker();
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const {
                    data: {
                        text
                    }
                } = await worker.recognize(imageOut.toBlob());
                document.getElementById('Txt_VeriCode').value = text;
                document.getElementById("ibnSubmit").click();
                console.log(text);
            })();
        });
    }
    setTimeout(function() {
        OCR();
    }, 1);
})();
