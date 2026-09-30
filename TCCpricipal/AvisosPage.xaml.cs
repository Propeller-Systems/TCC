using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;

namespace TCCpricipal
{
    public partial class AvisosPage : ContentPage
    {
        public AvisosPage()
        {
            Title = "Avisos e Notícias";
            BackgroundColor = Colors.White;

            // Botão de criar notícia (canto superior direito)
            var btnCriar = new Button
            {
                Text = "+ Criar Notícia",
                BackgroundColor = Colors.Black,
                TextColor = Colors.White,
                CornerRadius = 8,
                Padding = new Thickness(12,6),
                HorizontalOptions = LayoutOptions.End
            };

            // Cabeçalho com título e botão
            var headerGrid = new Grid
            {
                ColumnDefinitions = new ColumnDefinitionCollection
                {
                    new ColumnDefinition { Width = GridLength.Star },
                    new ColumnDefinition { Width = GridLength.Auto }
                },
                Children =
                {
                    new Label { Text = "Avisos e Notícias", FontSize = 34, FontAttributes = FontAttributes.Bold, TextColor = Colors.Black, VerticalOptions = LayoutOptions.Center },
                    btnCriar
                }
            };
            Grid.SetColumn(btnCriar, 1);

            var subtitle = new Label
            {
                Text = "Envie informações para alunos, professores e turmas",
                FontSize = 14,
                TextColor = Colors.Gray
            };

            // Lista de avisos de exemplo
            var avisosList = new VerticalStackLayout { Spacing = 20 };

            void AddAviso(string titulo, string dataAutor, string texto)
            {
                var frame = new Frame
                {
                    CornerRadius = 12,
                    HasShadow = true,
                    Padding = new Thickness(18),
                    BackgroundColor = Color.FromArgb("#F8F8F8"),
                    Content = new Grid
                    {
                        ColumnDefinitions = new ColumnDefinitionCollection { new ColumnDefinition { Width = GridLength.Star }, new ColumnDefinition { Width = GridLength.Auto } },
                        Children =
                        {
                            new VerticalStackLayout
                            {
                                Spacing = 6,
                                Children =
                                {
                                    new Label { Text = titulo, FontSize = 22, FontAttributes = FontAttributes.Bold, TextColor = Colors.Black },
                                    new Label { Text = dataAutor, FontSize = 12, TextColor = Colors.DarkGray },
                                    new Label { Text = texto, FontSize = 14, TextColor = Colors.Gray }
                                }
                            },

                            new Button { Text = "⋮", BackgroundColor = Colors.Transparent, BorderWidth = 0, FontSize = 20, TextColor = Colors.DarkGray, HorizontalOptions = LayoutOptions.End }
                        }
                    }
                };

                Grid.SetColumn(frame.Content as VisualElement, 0);
                avisosList.Children.Add(frame);
            }

            AddAviso("Organização do Ambiente de Trabalho", "31/08/2026 • Autor: admin", "Pedimos a colaboração de todos para manter os espaços de trabalho limpos e organizados. Ao finalizar suas atividades, lembre-se de guardar materiais e descartar resíduos corretamente. A organização contribui para um ambiente mais agradável e produtivo.");
            AddAviso("Manutenção no Sistema", "31/08/2026 • Autor: admin", "Informamos que o sistema interno da empresa passará por uma manutenção programada amanhã, das 18h às 20h. Durante esse período, alguns serviços poderão ficar indisponíveis. Agradecemos a compreensão de todos.");
            AddAviso("Reunião de Equipe", "31/08/2026 • Autor: admin", "Haverá reunião de equipe na próxima segunda-feira às 09h para alinhamento das atividades da semana. Participação obrigatória para líderes de projeto.");

            // Monta a página
            Content = new ScrollView
            {
                Content = new VerticalStackLayout
                {
                    Padding = 20,
                    Spacing = 12,
                    Children =
                    {
                        headerGrid,
                        subtitle,
                        new BoxView { HeightRequest = 1, BackgroundColor = Color.FromArgb("#E0E0E0") },
                        avisosList
                    }
                }
            };
        }
    }
}
