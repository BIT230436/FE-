pipeline {
    agent any

   environment {
        DOCKER_IMAGE = 'minhp205/internship-be'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo '📥 Cloning FE repository...'
                git branch: 'main', url: 'https://github.com/Qu-n-Ly-Internship/FE.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                script {
                    docker.build("${IMAGE_NAME}:latest")
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo '⬆️ Pushing image to DockerHub...'
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKERHUB_CREDENTIALS}") {
                        docker.image("${IMAGE_NAME}:latest").push()
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying container...'
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
