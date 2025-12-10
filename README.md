# 📱 QRQUOTE

O **QRQUOTE** é um aplicativo desenvolvido para auxiliar pessoas com deficiência visual. Ele permite a leitura instantânea de QR Codes, convertendo informações visuais em feedback sonoro e háptico, promovendo maior autonomia em diversos ambientes.

---

## 🎯 Objetivo do Projeto

O principal intuito do QRQUOTE é derrubar barreiras de informação:
- **Acessibilidade Imediata:** Transformar o conteúdo estático de códigos QR em fala fluida e compreensível.
- **Interação Intuitiva:** Detectar links automaticamente e oferecer ações rápidas (abrir navegador, copiar), sem menus complexos.
- **Personalização:** Oferecer controles granulares de acessibilidade, como ajuste de velocidade da fala e feedback tátil.
- **Inclusão:** Facilitar a disseminação de informações úteis (horários, contatos, descrições de produtos) de forma acessível.

---

## ✨ Funcionalidades Principais

O aplicativo foi desenhado com foco total na Usabilidade (UX) para deficientes visuais:

* 👁️ **Scanner Inteligente:** Captura e processamento instantâneo de dados utilizando `expo-camera`.
* 🗣️ **Narrativa TTS (Text-to-Speech):** Leitura em voz alta do conteúdo via `expo-speech`, com suporte a seleção de vozes do sistema.
* ⏩ **Controle Dinâmico de Velocidade:** Sistema de ciclo rápido (Normal → Rápida → Muito Rápida) com feedback sonoro e vibração para confirmação.
* 🔗 **Gerenciamento de Links:** Identificação automática de URLs no QR Code com atalhos de navegação.
* 🔦 **Auxílio em Baixa Luz:** Controle de lanterna integrado para garantir a leitura em ambientes escuros.
* 👋 **Shake-to-Cancel:** Uso do acelerômetro (`expo-sensors`) para interromper a leitura imediatamente ao detectar um movimento brusco (agitar o celular).

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com foco em performance e compatibilidade multiplataforma:

- **Framework:** [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/)
- **Câmera:** `expo-camera`
- **Síntese de Voz:** `expo-speech`
- **Sensores:** `expo-sensors` (Acelerômetro)
- **Feedback Tátil:** `expo-haptics`

---

## 📂 Estrutura do Código

A lógica principal da aplicação está centralizada para facilitar a manutenção:

- **Tela Principal:** `app/(tabs)/index.tsx`
  - Contém a lógica do scanner.
  - Gerenciamento do ciclo de vida da leitura de voz.
  - Implementação dos controles de acessibilidade.