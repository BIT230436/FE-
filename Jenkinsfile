pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'minhp205/internship-fe'          
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'  
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔹 Cloning FE source code...'
                git branch: 'main', url: 'https://github.com/Qu-n-Ly-Internship/FE.git'
            }
        }

        stage('Build React App') {
            steps {
                echo '🔹 Building React app...'
                bat '''
                if exist package.json (
                    echo Installing dependencies...
                    call npm install
                    echo Building project...
                    call npm run build
                ) else (
                    echo package.json not found!
                    exit /b 1
                )
                '''
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                script {
                    def image = docker.build("${DOCKER_IMAGE}:latest")

                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_CREDENTIALS_ID}") {
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying frontend container...'
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
            echo '✅ Frontend deployment successful!'
        }
        failure {
            echo '❌ Frontend build failed!'
        }
    }
}
