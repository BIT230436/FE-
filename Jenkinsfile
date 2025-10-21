pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        IMAGE_NAME = 'minhp205/internship-fe'
    }

    stages {
        stage('Clone repository') {
            steps {
                git branch: 'main', url: 'https://github.com/Qu-n-Ly-Internship/FE.git'
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:latest")
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKERHUB_CREDENTIALS}") {
                        docker.image("${IMAGE_NAME}:latest").push()
                    }
                }
            }
        }

        stage('Deploy container') {
            steps {
                bat '''
                    docker stop internship-fe || echo Container not running
                    docker rm internship-fe || echo Container not found
                    docker run -d -p 3000:80 --name internship-fe minhp205/internship-fe:latest
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Frontend deployed successfully!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
    }
}
