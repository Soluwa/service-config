import com.lloydsbanking.*

properties([
  [$class: "ParametersDefinitionProperty", parameterDefinitions: [
    [$class: "BooleanParameterDefinition",
      name: "DEPLOY",
      defaultValue: false,
      description: "Do you want to deploy?"]
  ]]
])

node() {
  def ARTEFACT_URL = BRANCH_NAME == "master" ? env.ARTEFACT_RELEASES_URL : env.ARTEFACT_RELEASE_CANDIDATES_URL

  stage('setup') {
    checkout(scm)
    env.PATH = "${tool('node-8.9.4')}/bin:${env.PATH}"
    env.PATH = "${tool('cf-6.32.0')}:${env.PATH}"
    sh("npm config set cafile=${env.CERTIFICATES_LOCATION}");
    sh("npm config set registry ${env.NPM_REGISTRY}")
    withCredentials([usernamePassword(credentialsId: 'bluemix', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
      sh("cf login -a https://api.lbg.eu-gb.bluemix.net -u $USERNAME -p $PASSWORD")
    }
  }

  stage('Check Branch Access') {
   if (env.CHANGE_TARGET == "master" && (env.CHANGE_BRANCH != "develop" && !env.CHANGE_BRANCH.startsWith("hotfix"))) {
      error('Only develop or hotfix can merge to master')
    }
  }

  stage('Build') {
    sh('npm i')
    sh('npm run dist')
  }

  if (env.BRANCH_NAME.startsWith("PR-") && env.CHANGE_TARGET != "master") {

    stage('Check Version') {
      sh('npm run tool -- version-verify')
    }

    stage('Lint') {
      sh('npm run lint')
      sh('npm run format:verify')
    }

    stage('Unit Tests') {
      sh('npm run test:coverage')
    }

    stage('Upload Coverage Reports To Nexus') {
      withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
        sh("npm run tool -- upload-artefact -d coverage -s coverage -n https://nexus.sandbox.extranet.group/nexus/content/repositories/reports/tooling -u $NEXUS_USER -p $NEXUS_PASS")
      }
    }
    stage("Add Coverage reports to jenkins") {
      publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Unit Test Coverage', reportTitles: ''])
    }

    // stage('Api Tests') {
    //   sh("npm run deploy:ci")
    //   def manifest = readYaml file: 'manifest.yml'
    //   sh("NODE_ENV=${manifest.env.NODE_ENV} API_SECRET=${manifest.env.API_SECRET} API_KEY=${manifest.env.API_KEY} CBAAS_VERSION=${manifest.env.CBAAS_DEFAULT_VERSION} SERVICE_URL=https://sc-caf-service-task-cbaas-data-review.lbg.eu-gb.mybluemix.net/ PROXY_URL=http://10.113.60.137:50000 AUTH_SERVICE_URL=https://sc-caf-service-authentication-cbaas-data-review.lbg.eu-gb.mybluemix.net/ npm run test:component")
    //   archiveArtifacts artifacts: 'tests/API/reports/index.html, tests/API/reports/cucumber-report.json', fingerprint: true
    //   cucumber buildStatus: 'UNSTABLE',
    //     jsonReportDirectory: 'tests/API/reports/',
    //     fileIncludePattern: 'cucumber-report.json',
    //     trendsLimit: 10
    // }

    // stage('Upload Cucumber Reports To Nexus'){
    //   withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]){
    //     sh("npm run tool -- upload-artefact -d tests/API/reports -s cucumber -n https://nexus.sandbox.extranet.group/nexus/content/repositories/reports/tooling -u $NEXUS_USER -p $NEXUS_PASS")
    //   }
    // }
  }

  if (env.BRANCH_NAME == "develop"
    && !params.DEPLOY) {
    stage('Create release-candidate artefact') {
      withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
        sh("npm run tool -- upload-artefact -u $USERNAME -p $PASSWORD")
      }
    }

    stage('Tag repo with package version') {
      withCredentials([usernamePassword(credentialsId: "github", passwordVariable: "GIT_PASSWORD", usernameVariable: "GIT_USERNAME")]) {
        sh('git tag -f "rc-"$(node -p "require(\'./package.json\').version")')
        sh('git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.lbg.eu-gb.bluemix.net/CAF/tooling-service-config.git --tags')
      }
    }
  } else if (env.BRANCH_NAME == "master"
    && !params.DEPLOY) {
    stage('Promote artefact to releases') {
      withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
        sh("npm run tool -- promote-artefact -u $USERNAME -p $PASSWORD")
      }
    }
  }

  if (params.DEPLOY) {
      stage("Deploy to bluemix") {
          // get the package app names and related artifacts
          def packageJson = readJSON(file: "package.json")
          def appName = packageJson.name
          def artefacts = sh(script: "curl -s ${ARTEFACT_URL}/cbaas/${appName}/ | grep '${appName}' | sed 's/.*href=\"//' | sed 's/\".*//' | sed 's/${appName}//' | grep -oE '${appName}.*' | grep -vE '(md5|sha1)' | sort -r", returnStdout: true).split("\n").toList()

          // ask the release environment
          def organisations = ['POC21_CognitiveComputing']

          if (env.BRANCH_NAME == "master") {
              organisations.push('PILOT')
              organisations.push('PRE-PILOT')
          }

          def versionOptions = input(message: "Choose version and organisation", parameters: [
            [$class: 'ChoiceParameterDefinition', choices: artefacts, description: 'Please select an artefact', name: 'ARTEFACT'],
            [$class: 'ChoiceParameterDefinition', choices: organisations, description: "Please provide the bluemix organisation to deploy to", name: "BLUEMIX_ORG"],
          ])

          // set the space
          def space = 'POC21_CognitiveReview'

          if (versionOptions.BLUEMIX_ORG != "PILOT" && versionOptions.BLUEMIX_ORG != "PRE-PILOT") {
              sh("cf target -o ${versionOptions.BLUEMIX_ORG}")
              def avaliableSpaces = sh(script: "cf spaces | grep 'CBAAS-DATA-REVIEW' | sort -r", returnStdout: true).split("\n").toList()
              def spaceOptions = input(message: "Deploy a version of the tooling service onto bluemix", parameters: [
                  [$class: 'ChoiceParameterDefinition', choices: avaliableSpaces , description: "Please provide the bluemix space to deploy to", name: "BLUEMIX_SPACE"]
              ])

              space = spaceOptions
          }

          // TODO replace below deploy to javascript
          // get the artefact
          try {
            sh("wget --quiet ${ARTEFACT_URL}/cbaas/${appName}/${versionOptions.ARTEFACT}");
            sh("unzip -o ${versionOptions.ARTEFACT} -d dist")
          } catch (error) {
            echo("Failed to retrieve artefact: ${error.message}")
            throw error
          }

          // go into the distribution to get version
          def artefactPackageJson = readJSON(file: "./dist/package.json")
          def artefactVersion = artefactPackageJson.version

          // set the org and space
          sh("cf target -o ${versionOptions.BLUEMIX_ORG}")
          sh("cf target -s ${space}")

          // set the version
          def appSuffix = ""
          def versioned = ""
          if (versionOptions.BLUEMIX_ORG == "PILOT" || versionOptions.BLUEMIX_ORG == "PRE-PILOT") {
              appSuffix = versionOptions.BLUEMIX_ORG
              versioned = "${appSuffix}-${artefactVersion.replace('.','-')}"
          } else {
              appSuffix = space
              versioned = "${appSuffix}-${artefactVersion.replace('.','-')}"
          }

          // set the manifest for release
          dir("dist") {
              sh("sed -i -e 's/${appName}-${appSuffix.toLowerCase()}/${appName}-${versioned.toLowerCase()}/g' manifest.yml")
              // release with no start
              sh("cf push ${appName}-${versioned.toLowerCase()} --no-start")

              // copy settings from previous version
              // TODO replace copy with config manifest
              def previousVersions = sh(script: "cf apps | grep ${appName} | sort -r", returnStdout: true).split("\n").toList()
              if (previousVersions != "") {
                  def previousVersionName = previousVersions[0].split(" ").toList()[0]

                  def envs = sh(script: "cf env ${previousVersionName} | awk '/User-Provided:/{flag=1;next}/^\$/{flag=0}flag'", returnStdout: true).split("\n").toList()

                  for (env in envs ) {
                      def envSplit = env.split(": ")
                      def output = sh (script: "#!/bin/sh -e\n cf set-env ${appName}-${versioned.toLowerCase()} ${envSplit[0]} '${envSplit[1].trim()}'", returnStdout: true).trim()
                  }

                  // start the app
                  sh("cf start ${appName}-${versioned.toLowerCase()}")
              }
          }
      }
   }
}

