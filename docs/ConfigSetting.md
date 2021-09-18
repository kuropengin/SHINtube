# configファイルについて
"config"フォルダー内のconfigファイルを編集、または環境変数によってSHINtubeを利用する際に必要となる設定を行うことができます。

## backend_config.jsonについて
### backend_url (必須)
SHINtube-video-apiが動作しているURL。環境変数`BACK_DOMAIN`でも指定可能
```bash
"backend_url" : "https://back.com"
```

## db_config.jsonについて
### mongo_url 
MongoDBが動作しているドメイン、またはIPアドレス。環境変数`DB_URL`でも指定可能
```bash
"mongo_url" : "127.0.0.1:27017" 
```
入力が無い場合は`mongo`

### db_name
MongoDBに作成したDB名。環境変数`DB_NAME`でも指定可能
```bash
"db_name" : "SHINtube" 
```
入力が無い場合は`SHINtube`

### user
MongoDBのDBに登録したuser名。環境変数`DB_USER`でも指定可能
```bash
"user" : "root" 
```
入力が無い場合は`root`

### pass
MongoDBのDBに登録したuserのパスワード。環境変数`DB_PASS`でも指定可能
```bash
"pass" : "pass" 
```
入力が無い場合は`pass`

## lti_config.jsonについて

### my_domain (※[動的登録機能](./RegistrationLMS.md)を利用する場合は必須)
動的登録機能でLMSに渡す自身のURL
```bash
"my_domain" : "https://hoge.com"
```

### reg_key 
動的登録機能を利用する際のシークレットキー
```bash
"reg_key" : "pass1234"
```
入力が無い場合は`pass1234`

### platform
SHINtubeにLMSを登録する為の項目。詳しくは[configファイルによる外部ツール登録](./RegistrationLMS.md#lti_configファイルによる外部ツール登録)を参照
```bash
"platform" : [
    {
        "name" : "",
        "url" : "", 
        "key" : ""
    }
]
```