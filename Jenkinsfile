/**
 * Jenkinsfile – CI/CD Pipeline for BOA Mainframe Automation POC (Java/Maven)
 */
pipeline {
    agent any
    parameters {
        choice(name: 'TEST_ENV', choices: ['SIT', 'UAT'], description: 'Target environment')
    }
    environment {
        TEST_ENV = "${params.TEST_ENV}"
        RESULTS = 'target/surefire-reports'
        LEANFT_REPORT = 'RunResults'
    }
    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Run Automation Suite') {
            steps {
                echo "Running TestNG Suite against ${TEST_ENV}..."
                // Maven executes TestNG, passing the environment variable securely
                sh "mvn clean test -Denv=${TEST_ENV}"
            }
            post {
                always {
                    archiveArtifacts artifacts: "${env.RESULTS}/**/*", allowEmptyArchive: true
                    archiveArtifacts artifacts: "${env.LEANFT_REPORT}/**/*", allowEmptyArchive: true
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.LEANFT_REPORT}",
                        reportFiles: 'run_results.html',
                        reportName: 'LeanFT Java Report'
                    ])
                }
            }
        }
    }
}
