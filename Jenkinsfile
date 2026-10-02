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
                withCredentials([string(
                    credentialsId: 'expense-db-password',
                    variable: 'DB_PASSWORD'
                )]) {
                    sh 'docker compose up -d --build'
                }
            }
        }

        stage('Check Application') {
            steps {
                withCredentials([string(
                    credentialsId: 'expense-db-password',
                    variable: 'DB_PASSWORD'
                )]) {
                    sh 'docker compose ps'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}
```
