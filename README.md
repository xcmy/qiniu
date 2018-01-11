## 七牛云文件上传

一个简单的七牛云文件上传测试


### 引入七牛云

```
npm install qiniu --save
```

### 上传凭证

- 基础设置

```js
//存储空间名称
var bucket = 'bucket';
//上传秘钥（在七牛云账户秘钥管理处获得）
var accessKey = 'your access';
var secretKey = 'you secret';
//鉴权对象
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
```

- 带数据处理指令的配置
```js
//初始化
var saveJpgEntry = qiniu.util.urlsafeBase64Encode(bucket +':'+ '存于七牛云文件名');
//图片样式（在七牛云上添加然后复制过来）
fops = "imageView2/1/w/100/h/100/format/webp/q/75|watermark/2/text/NWk=/font/5a6L5L2T/fontsize/240/fill/IzAwMDAwMA==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim"
//数据处理指令，支持多个指令
var vframeJpgFop =fops  +'|saveas/'+ saveJpgEntry;
//选项配置
var options = {
    //存储空间名称
    scope: bucket,
    //自定义凭证有效期（以秒为单位，7200为两小时）
    expires: 7200,
    //自定义返回的JSON格式内容
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
    //将多个数据处理指令拼接起来
    persistentOps:  vframeJpgFop,
    //数据处理队列名称，必填（在七牛云上多媒体处理新建数据处理队列）
    persistentPipeline: "img-pipe",
    // //数据处理完成结果通知地址
    // persistentNotifyUrl: "http://api.example.com/qiniu/pfop/notify",
};
```

- 生成上传凭证

```js
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken=putPolicy.uploadToken(mac);

```

###  文件上传


- 构建配置

```js
//初始化
var config = new qiniu.conf.Config();
// 空间对应的机房(z1代表华北)
config.zone = qiniu.zone.Zone_z1;
// 是否使用https域名
//config.useHttpsDomain = true;
// 上传是否使用cdn加速
//config.useCdnDomain = true;

```

- 本地文件

```js
var localFile = "/Users/liuyang/Desktop/min.png";

```

- 上传方式

```js
//这里使用文件分片上传（断点续传），可以监听上传进度
var resumeUploader = new qiniu.resume_up.ResumeUploader(config);

```

- 获取上传进度

```js
var putExtra = new qiniu.resume_up.PutExtra();
//扩展参数
putExtra.params = {
    // "x:name": "",
    // "x:age": 27,
}
putExtra.fname = "";
//如果指定了断点记录文件，那么下次会从指定的该文件尝试读取上次上传的进度，以实现断点续传
// putExtra.resumeRecordFile = 'progress.log';
putExtra.progressCallback = function(uploadBytes, totalBytes) {
    //上传进度
    console.log("progress:" + uploadBytes*100/totalBytes+'%' );
}
```


- 文件上传

```js
resumeUploader.putFile(uploadToken, null, localFile, putExtra, function(respErr,respBody, respInfo) {
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
```




## 项目运行

- 安装依赖
```
cnpm install
```
- 修改用户上传秘钥和文件路径

- 执行
```
node index.js
```

- 返回格式

```shell
$ node index.js
progress:100%
{ key: 'xxx',
  hash: 'xxx',
  fsize: 915886,
  bucket: 'xxx',
  name: 'null' }
```














