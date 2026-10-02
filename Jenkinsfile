pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Syntax Check') {
            steps {
                dir('backend') {
                    sh 'node --check server.js'
                    sh 'node --check db.js'
                    sh 'node --check routes/expenses.js'
                }
            }
        }

        stage('Build and Run') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

        stage('Check Application') {
            steps {
                sh 'curl -f http://localhost:4000/api/expenses'
            }
        }
    }

    post {
        success {
            echo 'Expense Tracker deployed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
