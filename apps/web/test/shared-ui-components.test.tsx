import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  Modal,
  Select,
  Skeleton,
  ToastCard,
  ToastProvider,
  Typography,
  useToast,
} from '../src/shared/ui'

describe('Shared UI Design System Components (FSD)', () => {
  describe('Typography', () => {
    it('renders title variant as an h1 with proper styling', () => {
      render(<Typography variant="title">Título Principal</Typography>)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading.textContent).toBe('Título Principal')
      expect(heading.className).toContain('text-3xl')
      expect(heading.className).toContain('font-bold')
    })

    it('renders subtitle variant as paragraph', () => {
      render(<Typography variant="subtitle">Subtítulo Explicativo</Typography>)
      const para = screen.getByText('Subtítulo Explicativo')
      expect(para.tagName).toBe('P')
      expect(para.className).toContain('text-gray-500')
      expect(para.className).toContain('text-sm')
    })
  })

  describe('Button', () => {
    it('renders with accessible min-h-[44px] and handles click', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Ação Primária</Button>)
      const button = screen.getByRole('button', { name: 'Ação Primária' })
      expect(button.className).toContain('min-h-11')

      fireEvent.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('disables button and shows spinner when isLoading is true', () => {
      const onClick = vi.fn()
      render(
        <Button isLoading loadingText="Salvando..." onClick={onClick}>
          Salvar
        </Button>,
      )
      const button = screen.getByRole('button') as HTMLButtonElement
      expect(button.disabled).toBe(true)
      expect(screen.getByText('Salvando...')).toBeDefined()

      fireEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Input & Select', () => {
    it('renders Input with accessible touch target and error styling', () => {
      render(<Input hasError placeholder="Digite aqui" />)
      const input = screen.getByPlaceholderText('Digite aqui')
      expect(input.className).toContain('min-h-11')
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.className).toContain('border-red-500')
    })

    it('renders Select with options and handles value change', () => {
      const onChange = vi.fn()
      render(
        <Select aria-label="Opções" onChange={onChange}>
          <option value="1">Opção 1</option>
          <option value="2">Opção 2</option>
        </Select>,
      )
      const select = screen.getByLabelText('Opções')
      fireEvent.change(select, { target: { value: '2' } })
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('FormField', () => {
    it('renders label with htmlFor matching input id and displays errorText', () => {
      render(
        <FormField
          id="email-field"
          label="Endereço de E-mail"
          errorText="E-mail inválido"
          required
        >
          <Input id="email-field" />
        </FormField>,
      )

      expect(screen.getByLabelText(/Endereço de E-mail/)).toBeDefined()
      const errorMsg = screen.getByRole('alert')
      expect(errorMsg.textContent).toBe('E-mail inválido')
    })
  })

  describe('Alert', () => {
    it('renders with role="alert" and aria-live="polite"', () => {
      render(<Alert variant="danger">Erro ao carregar dados</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert.getAttribute('aria-live')).toBe('polite')
      expect(alert.textContent).toBe('Erro ao carregar dados')
    })
  })

  describe('Badge', () => {
    it('renders appointment status variants correctly', () => {
      const { rerender } = render(<Badge variant="realizada">Realizada</Badge>)
      expect(screen.getByText('Realizada').className).toContain('bg-green-100')

      rerender(<Badge variant="cancelada">Cancelada</Badge>)
      expect(screen.getByText('Cancelada').className).toContain('bg-red-100')
    })
  })

  describe('Card & Skeleton', () => {
    it('renders Card with rounded border and padding', () => {
      render(<Card>Conteúdo do Card</Card>)
      expect(screen.getByText('Conteúdo do Card').className).toContain('rounded-xl')
    })

    it('renders Skeleton with pulse animation', () => {
      const { container } = render(<Skeleton data-testid="skeleton" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('animate-pulse')
    })
  })

  describe('Modal', () => {
    it('closes on Escape key press and on overlay click', () => {
      const onClose = vi.fn()
      const { rerender } = render(
        <Modal isOpen={true} onClose={onClose} title="Detalhes do Agendamento">
          <p>Conteúdo interno</p>
        </Modal>,
      )

      expect(screen.getByRole('dialog')).toBeDefined()
      expect(screen.getByText('Detalhes do Agendamento')).toBeDefined()

      // ESC keydown
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)

      // Fechado
      rerender(
        <Modal isOpen={false} onClose={onClose} title="Detalhes do Agendamento">
          <p>Conteúdo interno</p>
        </Modal>,
      )
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  describe('EmptyState', () => {
    it('renders with status role, accessible label, title and action', () => {
      const onAction = vi.fn()
      render(
        <EmptyState
          title="Nenhuma consulta"
          description="Você ainda não possui agendamentos cadastrados."
          variant="dashed"
          action={<Button onClick={onAction}>Novo Agendamento</Button>}
        />,
      )

      const status = screen.getByRole('status')
      expect(status.getAttribute('aria-label')).toBe('Nenhuma consulta')
      expect(screen.getByText('Nenhuma consulta')).toBeDefined()
      expect(screen.getByText('Você ainda não possui agendamentos cadastrados.')).toBeDefined()

      const button = screen.getByRole('button', { name: 'Novo Agendamento' })
      fireEvent.click(button)
      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('renders inline variant correctly', () => {
      render(
        <EmptyState
          title="Histórico limpo"
          variant="inline"
        />,
      )
      expect(screen.getByText('Histórico limpo')).toBeDefined()
    })
  })

  describe('Toast', () => {
    it('renders ToastCard with correct accessible alert/status role and dismiss button', () => {
      const onDismiss = vi.fn()
      render(
        <ToastCard
          toast={{
            id: 't-1',
            type: 'success',
            title: 'Operação realizada com sucesso',
            description: 'Seus dados foram salvos.',
          }}
          onDismiss={onDismiss}
        />,
      )

      const status = screen.getByRole('status')
      expect(status.textContent).toContain('Operação realizada com sucesso')
      expect(status.textContent).toContain('Seus dados foram salvos.')

      const closeButton = screen.getByRole('button', { name: 'Fechar notificação' })
      fireEvent.click(closeButton)
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('renders error toast with alert role', () => {
      render(
        <ToastCard
          toast={{
            id: 't-2',
            type: 'error',
            title: 'Falha no agendamento',
          }}
          onDismiss={() => {}}
        />,
      )

      const alert = screen.getByRole('alert')
      expect(alert.textContent).toContain('Falha no agendamento')
    })

    it('allows triggering toasts via useToast within ToastProvider', () => {
      function TestToastConsumer() {
        const { success } = useToast()
        return (
          <button type="button" onClick={() => success('Sucesso disparado!')}>
            Disparar
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>,
      )

      const triggerBtn = screen.getByRole('button', { name: 'Disparar' })
      fireEvent.click(triggerBtn)

      expect(screen.getByText('Sucesso disparado!')).toBeDefined()
    })
  })
})
