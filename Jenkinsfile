/**
 * Jenkinsfile – CI/CD Pipeline for BOA Mainframe Automation POC (Python/py3270)
 *
 * Replaces the LeanFT/JavaScript pipeline from the Jarvis framework.
 * Supports execution against multiple environments (SIT / UAT).
 *
 * Prerequisites on the Jenkins agent:
 *   - Python 3.10+
 *   - wc3270 installed (includes s3270.exe) — https://x3270.miraheze.org/wiki/Downloads
 *   - s3270.exe on PATH of the Jenkins agent
 *   - Environment variables:
 *       TE_HOST      – mainframe TN3270 hostname
 *       TE_PORT      – TN3270 port (default 3270)
 *       TEST_ENV     – target environment label (SIT | UAT)
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
            description: 'Optional pytest keyword filter (e.g. "TC001" to run a single test)'
        )
        string(
            name: 'TE_HOST',
            defaultValue: 'mainframe.boa.example.com',
            description: 'TN3270 mainframe hostname'
        )
        string(
            name: 'TE_PORT',
            defaultValue: '3270',
            description: 'TN3270 port'
        )
    }

    environment {
        TEST_ENV = "${params.TEST_ENV}"
        TE_HOST  = "${params.TE_HOST}"
        TE_PORT  = "${params.TE_PORT}"
        RESULTS  = 'results'
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
                echo "Branch: ${env.GIT_BRANCH} | Env: ${env.TEST_ENV} | Host: ${env.TE_HOST}:${env.TE_PORT}"
            }
        }

        stage('Install Python Dependencies') {
            steps {
                sh 'python --version'
                sh 'pip install -r requirements.txt'
            }
        }

        stage('Pre-flight Checks') {
            steps {
                echo 'Verifying s3270 is available on PATH...'
                sh 's3270 -version || (echo "ERROR: s3270 not found. Install wc3270 and add to PATH." && exit 1)'
            }
        }

        stage('Run Automation Suite') {
            steps {
                script {
                    def filter = params.SUITE_FILTER?.trim()
                    def cmd = filter
                        ? "pytest tests/ -v -k \"${filter}\" --html=${env.RESULTS}/report.html --self-contained-html"
                        : "pytest tests/ -v --html=${env.RESULTS}/report.html --self-contained-html"
                    sh cmd
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${env.RESULTS}/**/*", allowEmptyArchive: true
                    publishHTML(target: [
                        allowMissing:          true,
                        alwaysLinkToLastBuild: true,
                        keepAll:               true,
                        reportDir:             "${env.RESULTS}",
                        reportFiles:           'report.html',
                        reportName:            'BOA FTD Automation Report'
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
            echo "Test run failed. Check the HTML report in the ${env.RESULTS} folder."
        }
        always {
            cleanWs(patterns: [[pattern: '.venv', type: 'EXCLUDE']])
        }
    }
}
