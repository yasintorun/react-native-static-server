import React, { useEffect, useState } from 'react'
import { Text, ActivityIndicator } from "react-native";
import { CreateWebZKitapAssets, WebZKitapPath } from './zKitap'
import StaticServer from 'react-native-static-server'
import WebView from 'react-native-webview'

CreateWebZKitapAssets({ url: "http://www.dijitalim.com.tr/Uploads/WebZKitapTest/WebZKitap.zip?v=12", companyId: "099" }).then(() => {
    console.log("İndirildi")
}).catch(err => {
    console.log("HATA:", err)
})

export default () => {
    const [origin, setOrigin] = useState<string>('')
    const [server, setServer] = useState<StaticServer>(null)
    useEffect(() => {
        startServer()
    }, [])
    const startServer = async (): Promise<void> => {
        const newServer = new StaticServer(8080, WebZKitapPath, { localOnly: true })
        const origin = await newServer.start()
        setOrigin(origin)
        setServer(newServer)
    }
    console.log(origin)
    return origin ? (
        <WebView
            javaScriptEnabled={true}
            originWhitelist={['*']}
            domStorageEnabled={true}
            source={{ uri: `${origin}/core/icons/AddedLink.png` }}
            allowFileAccess={true}
            cacheEnabled
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            allowFileAccessFromFileURLs
            injectedJavaScript=""
        />
    ) : (
        <ActivityIndicator size={"large"} />
    )
}