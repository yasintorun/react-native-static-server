import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from "react-native-zip-archive";

export const WebZKitapBasePath = Platform.OS == "android" ? RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath

export const WebZKitapPath = WebZKitapBasePath + "/WebZKitap/"

export const WebZKitapAppConfigPath = WebZKitapPath + "app.config.js"

export const WebZKitapVersionPath = WebZKitapPath + "version.txt"

export const WebZKitapAssetsPath = WebZKitapPath + "assets/"


export type DownloadZipProps = {
    url: string,
    targetPath: string,
    progress?: (bytesWritten: number) => void,
}
export type DownloadZipResult = {
    jobId: number,
    promise: Promise<any>,
}
export const DownloadZip = async (props: DownloadZipProps): Promise<DownloadZipResult> => {
    const { targetPath, url, progress } = props
    const saveZipPath = targetPath
    const downloadFetch = RNFS.downloadFile({
        fromUrl: url,
        toFile: saveZipPath,
        begin: () => console.log("asd"),
        progress(res) {
            progress && progress(res.bytesWritten)
        }
    });

    const promise = new Promise((resolve, reject) => {
        downloadFetch.promise.then(async () => {
            const targetLocationPath = saveZipPath.split(".").slice(0, -1).join(".")

            // await RNFS.mkdir(targetLocationPath)

            console.log(saveZipPath, targetLocationPath)

            unzip(saveZipPath, targetLocationPath, "CP866").then(() => { }).then(() => {
                RNFS.unlink(saveZipPath)
                resolve({})
            }).catch(err => {
                console.log(err)
                reject(err)
            })
        }).catch(err => {
            console.log(err, "don't download file")
            reject(err)
        })
    })

    return {
        jobId: downloadFetch.jobId,
        promise: promise
    }
}

export type CreateWebZKitapAssetsProps = {
    localPath?: string,
    url?: string,
    targetPath?: string,
    companyId: string,
}
export const CreateWebZKitapAssets = async (props: CreateWebZKitapAssetsProps): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const { localPath, url } = props
        const targetPath = props.targetPath ?? (Platform.OS == "android" ? RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath) + "/WebZKitap.zip";
        const targetLocationPath = targetPath.split("/").slice(0, -1).join("/")

        try {
            const isExistsPlayer = await RNFS.exists(WebZKitapAppConfigPath)
            if (isExistsPlayer) {
                // const lts = await CheckZKitapPlayerVersion(companyId)
                // if(!lts.isLTS) {
                //     console.log(lts)
                //     await DownloadZip({
                //         url: lts.path,
                //         targetPath: WebZKitapPath+"update.zip"
                //     })
                //     await RNFS.writeFile(WebZKitapVersionPath, lts.version)
                // }
                resolve({});
                return;
            };

            const isExists = await RNFS.exists(targetPath)
            if (isExists) {
                await RNFS.unlink(targetPath)
            }
            if (localPath) {
                const zKitapPath = targetPath
                await RNFS.copyFileAssets("WebZKitap.zip", zKitapPath)

                const stat = await RNFS.stat(zKitapPath)
                await unzip(stat.path, targetLocationPath)
            }
            else if (url) {
                const downloadFetch = await DownloadZip({ targetPath: targetPath, url: url })
                await downloadFetch.promise
            }
            else {
                reject({ message: "Local veya url adresi girmeniz gerekmektedir." })
            }

            await RNFS.writeFile(WebZKitapVersionPath, "1")
            // console.log(localVersion, version)

            resolve({})
        } catch {
            reject({ message: "Dosya oluşturulurken hata oluştu." })
        }
    })
}
