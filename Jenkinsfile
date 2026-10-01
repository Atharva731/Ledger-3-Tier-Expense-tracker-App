pipeline {
    agent any

    environment {
        COMPOSE_ENV_CRED = 'expense-db-password'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Syntax / Sanity Check') {
            steps {
                dir('backend') {
                    sh 'node --check server.js'
                    sh 'node --check db.js'
                    sh 'node --check routes/expenses.js'
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                withCredentials([string(
                    credentialsId: COMPOSE_ENV_CRED,
                    variable: 'DB_PASSWORD'
                )]) {
                    sh '''
                        export DB_PASSWORD="$DB_PASSWORD"

                        docker compose down || true

                        docker compose up -d --build
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    sleep 8

                    curl -f http://localhost:4000/api/expenses || \
                    (echo "Health check failed" && exit 1)
                '''
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
        }

        success {
            echo 'Expense Tracker deployed successfully.'
        }

        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
    }
}
