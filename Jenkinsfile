import groovy.json.JsonSlurper;

node {
    def nodeHome, npm, node // tools
    def application = "k8s-testapp"
    def committerEmail, releaseVersion // metadata
    def dockerBuildDir = "./docker"
    def appConfig = "app-config.yaml"
    def nexusUser = "deployment"
    def nexusPassword = "d3pl0y"
    def groupId = "nais"

    try {
        stage("checkout") {
            git url: "ssh://git@stash.devillo.no:7999/aura/${application}.git"
        }

        stage("initialize") {
            npm = "/usr/bin/npm"
            node = "/usr/bin/node"

            committerEmail = sh(script: 'git log -1 --pretty=format:"%ae"', returnStdout: true).trim()
            releaseVersion = sh(script: 'npm version major | cut -d"v" -f2', returnStdout: true).trim()
        }
        stage("unit-tests") {
            sh "sleep 3"
        }
        stage("create version") {
                    sh "git push origin master"
                    sh "git tag -a ${application}-${releaseVersion} -m ${application}-${releaseVersion}"
                    sh "git push --tags"
        }

        stage("build") {
            sh "rm -rf ${dockerBuildDir} && mkdir -p ${dockerBuildDir}"
            sh "cp -r ./Dockerfile ./package.json ./src ${dockerBuildDir}"

            dir(dockerBuildDir){
                withEnv(['HTTP_PROXY=http://webproxy-utvikler.nav.no:8088', 'NO_PROXY=adeo.no']) {
                    sh "${npm} install --production"
                }
            }

            def imageName = "docker.adeo.no:5000/${application}:${releaseVersion}"
            sh "sudo docker build -t ${imageName} ${dockerBuildDir}"
            sh "sudo docker push ${imageName}"
        }

        stage("copy-app-config") {
            sh "curl -s -F r=m2internal -F hasPom=false -F e=yaml -F g=${groupId} -F a=${application} -F v=${releaseVersion} -F p=yaml -F file=@${appConfig} -u ${nexusUser}:${nexusPassword} http://maven.adeo.no/nexus/service/local/artifact/maven/content"
        }

        stage("deploy-application") {
			withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'srvauraautodeploy', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                sh "curl -k -d \'{\"application\": \"k8s-testapp\", \"version\": \"${releaseVersion}\", \"environment\": \"u1\", \"zone\": \"fss\", \"username\": \"${env.USERNAME}\", \"password\": \"${env.PASSWORD}\", \"namespace\": \"default\"}\' https://daemon.nais.devillo.no/deploy"
            }
        }

        stage("Check resources") {
        sh "echo waiting for application to become available"
        sh "sleep 10"
            URL envUrl = "https://k8s-testapp.nais.devillo.no/env".toUrl()
            def res = new JsonSlurper().parse(apiUrl.newReader())
            assert res['k8s_testappCredential_username'] == 'testUser'
            assert res['k8s_testappCredential_password'] == 'testPassword'
        }

        stage("integration-tests") {
            sh "sleep 5"
        }

        GString message = "${application}:${releaseVersion} now in production. See jenkins for more info ${env.BUILD_URL}\n"
        mail body: message, from: "jenkins@aura.adeo.no", subject: "SUCCESSFULLY completed ${env.JOB_NAME}!", to: committerEmail
    } catch (e) {
        currentBuild.result = "FAILED"
        throw e

        GString message = "AIAIAI! Your last commit on ${application} didn't go through. See log for more info ${env.BUILD_URL}\n"
        mail body: message, from: "jenkins@aura.adeo.no", subject: "FAILED to complete ${env.JOB_NAME}", to: committerEmail
    }
}
