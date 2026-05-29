#!/bin/bash
# Script para executar NO SEU COMPUTADOR

echo "🚀 SIGMA AI - Deploy Automático"

# Instale o Vercel CLI se não tiver
npm install -g vercel

# Login no Vercel (abre navegador)
vercel login

# Deploy em produção
vercel --prod --yes

echo "✅ PRONTO! Seu app está publicado!"
