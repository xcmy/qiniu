const qiniu = require("qiniu");

var bucket = 'xxx';
var accessKey = 'xxx';
var secretKey = 'xxx';

var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

var name  = 'music.png';

var saveJpgEntry = qiniu.util.urlsafeBase64Encode(bucket +':'+ name);
fops = "imageView2/1/w/100/h/100/format/webp/q/75|watermark/2/text/NWk=/font/5a6L5L2T/fontsize/240/fill/IzAwMDAwMA==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim"
//数据处理指令，支持多个指令
var vframeJpgFop =fops  +'|saveas/'+ saveJpgEntry;

var options = {
    scope: bucket,
    expires: 7200,
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
    //将多个数据处理指令拼接起来
    persistentOps:  vframeJpgFop,
    //数据处理队列名称，必填
    persistentPipeline: "img-pipe",
    // //数据处理完成结果通知地址
    // persistentNotifyUrl: "http://api.example.com/qiniu/pfop/notify",
};

var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken=putPolicy.uploadToken(mac);

var config = new qiniu.conf.Config();
var localFile = "/Users/xcmy/Desktop/min.png";
config.zone = qiniu.zone.Zone_z1;
config.useCdnDomain = true;


var resumeUploader = new qiniu.resume_up.ResumeUploader(config);
var putExtra = new qiniu.resume_up.PutExtra();
putExtra.params = {
    // "x:name": "",
    // "x:age": 27,
}
putExtra.fname = name;
// putExtra.resumeRecordFile = 'progress.log';
putExtra.progressCallback = function(uploadBytes, totalBytes) {
    console.log("progress:" + uploadBytes*100/totalBytes+'%' );
}
//file
resumeUploader.putFile(uploadToken, null, localFile, putExtra, function(respErr, respBody, respInfo) {
    if (respErr) {
        throw respErr;
    }
    if (respInfo.statusCode == 200) {
        console.log(respBody);
    } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
    }
});