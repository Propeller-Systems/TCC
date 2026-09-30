namespace TCCpricipal
{
    public partial class AppShell : Shell
    {
        bool _isFlyoutCollapsed = false;
        bool _loginShown = false;

        public AppShell()
        {
            InitializeComponent();
            // Adia a exibição da tela de login até o Shell estar pronto
            this.Loaded += AppShell_Loaded;
            // Inicializa estado da flyout
            _isFlyoutCollapsed = false;
            // Estado inicial da flyout já está definido em _isFlyoutCollapsed
        }

        private async void AppShell_Loaded(object? sender, EventArgs e)
        {
            if (_loginShown)
                return;
            _loginShown = true;

            // Mostra a MainPage (login) como modal sobre o Shell para que o flyout não apareça
            await this.Navigation.PushModalAsync(new MainPage());
        }

        // Handler chamado quando o botão de alternância é clicado
        private void OnToggleFlyoutButtonClicked(object sender, System.EventArgs e)
        {
            // Valores de largura: expandido e colapsado
            const double expandedWidth = 220;
            const double collapsedWidth = 60;

            // tenta obter referência do próprio botão (sender) para atualizar o texto
            var senderBtn = sender as Microsoft.Maui.Controls.Button;

            // Atualiza na UI thread para garantir aplicação imediata
            Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(() =>
            {
                // Alterna largura
                if (_isFlyoutCollapsed)
                {
                    this.FlyoutWidth = expandedWidth;
                    if (senderBtn != null) senderBtn.Text = "«"; // aponta para esquerda quando expandido
                    _isFlyoutCollapsed = false;
                    // mostra logo se existir
                    if (this.FlyoutHeader is Microsoft.Maui.Controls.Grid hgrid && hgrid.Children.Count > 0 && hgrid.Children[0] is Microsoft.Maui.Controls.Label logo2)
                        logo2.IsVisible = true;
                }
                else
                {
                    this.FlyoutWidth = collapsedWidth;
                    if (senderBtn != null) senderBtn.Text = ">"; // aponta para direita quando colapsado
                    _isFlyoutCollapsed = true;
                    // esconde logo se existir
                    if (this.FlyoutHeader is Microsoft.Maui.Controls.Grid hgrid2 && hgrid2.Children.Count > 0 && hgrid2.Children[0] is Microsoft.Maui.Controls.Label logo3)
                        logo3.IsVisible = false;
                }
            });
        }
    }
}
