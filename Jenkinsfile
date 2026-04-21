/**
 * Jenkinsfile – CI/CD Pipeline for BOA Mainframe Automation POC
 *
 * Mirrors the Jenkinsfile (pipeline configuration) from the Jarvis framework.
 * Supports execution against multiple environments (SIT / UAT).
 *
 * Prerequisites on the Jenkins agent:
 *   - Node.js 18+
 *   - OpenText LeanFT Agent running on the build node (or a remote agent host)
 *   - Environment variables:
 *       TE_HOST      – mainframe hostname
 *       TE_PORT      – TN3270 port (default 23)
 *       TEST_ENV     – target environment label (SIT | UAT)
 *       LEANFT_AGENT – LeanFT agent host (if not localhost)
 */

pipeline {

    agent any

    parameters {
        choice(
            name: 'TEST_ENV',
            choices: ['SIT', 'UAT'],
            description: 'Target environment for test execution'
        )
        string(
            name: 'SUITE_FILTER',
            defaultValue: '',
            description: 'Optional Jasmine spec filter (e.g. "TC001" to run a single test)'
        )
    }

    environment {
        TEST_ENV  = "${params.TEST_ENV}"
        NODE_ENV  = 'test'
        RESULTS   = 'results'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.GIT_BRANCH} | Env: ${env.TEST_ENV}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node --version'
                sh 'npm ci'
            }
        }

        stage('Pre-flight Checks') {
            steps {
                echo "Verifying LeanFT agent connectivity..."
                sh 'node -e "const s=require(\'./config/settings\'); console.log(\'Agent:\', s.agent.host + \':\' + s.agent.port);"'
            }
        }

        stage('Run Automation Suite') {
            steps {
                script {
                    def filter = params.SUITE_FILTER?.trim()
                    def cmd = filter
                        ? "npx jasmine --filter=\"${filter}\""
                        : 'npm test'
                    sh cmd
                }
            }
            post {
                always {
                    // Archive LeanFT HTML report
                    archiveArtifacts artifacts: "${env.RESULTS}/**/*", allowEmptyArchive: true
                    publishHTML(target: [
                        allowMissing:          true,
                        alwaysLinkToLastBuild: true,
                        keepAll:               true,
                        reportDir:             "${env.RESULTS}",
                        reportFiles:           'index.html',
                        reportName:            'LeanFT Automation Report'
                    ])
                }
            }
        }

    }

    post {
        success {
            echo "All tests passed for environment: ${env.TEST_ENV}"
        }
        failure {
            echo "Test run failed. Check the LeanFT report in the ${env.RESULTS} folder."
        }
        always {
            cleanWs(patterns: [[pattern: 'node_modules', type: 'EXCLUDE']])
        }
    }
}
