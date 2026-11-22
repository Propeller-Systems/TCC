using Microsoft.Maui.Controls;
using Microsoft.Maui.Controls.Shapes;
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

            var tituloEntry = new Entry
            {
                Placeholder = "Adicione um título para seu evento/aviso/notícia",
                TextColor = Colors.Black,
                PlaceholderColor = Colors.Gray,
                BackgroundColor = Colors.White
            };
            var conteudoEditor = new Editor
            {
                Placeholder = "Adicione o conteúdo do seu evento/aviso/notícia",
                TextColor = Colors.Black,
                PlaceholderColor = Colors.Gray,
                BackgroundColor = Colors.White,
                HeightRequest = 90
            };
            var escopoEntry = new Entry
            {
                Text = "Geral",
                TextColor = Colors.Black,
                BackgroundColor = Colors.White
            };

            var cancelarButton = new Button
            {
                Text = "Cancelar",
                BackgroundColor = Color.FromArgb("#DC3545"),
                TextColor = Colors.White,
                CornerRadius = 4,
                HorizontalOptions = LayoutOptions.Start
            };
            var publicarButton = new Button
            {
                Text = "Publicar",
                BackgroundColor = Color.FromArgb("#198754"),
                TextColor = Colors.White,
                CornerRadius = 4,
                HorizontalOptions = LayoutOptions.Start
            };

            var modalOverlay = new Grid
            {
                IsVisible = false,
                BackgroundColor = Color.FromArgb("#66000000"),
                Padding = 24,
                Children =
                {
                    new Border
                    {
                        BackgroundColor = Colors.White,
                        Stroke = Colors.Transparent,
                        StrokeShape = new RoundRectangle { CornerRadius = 14 },
                        Padding = 24,
                        HorizontalOptions = LayoutOptions.Center,
                        VerticalOptions = LayoutOptions.Center,
                        MaximumWidthRequest = 760,
                        Content = new VerticalStackLayout
                        {
                            Spacing = 6,
                            Children =
                            {
                                new Label { Text = "Criar Novo Aviso", FontSize = 24, FontAttributes = FontAttributes.Bold, TextColor = Colors.Black },
                                new Label { Text = "Título:", TextColor = Colors.Black },
                                tituloEntry,
                                new Label { Text = "Conteúdo:", TextColor = Colors.Black },
                                conteudoEditor,
                                new Label { Text = "Escopo:", TextColor = Colors.Black },
                                escopoEntry,
                                new HorizontalStackLayout
                                {
                                    Spacing = 8,
                                    Children = { cancelarButton, publicarButton }
                                }
                            }
                        }
                    }
                }
            };

            btnCriar.Clicked += (_, _) => modalOverlay.IsVisible = true;
            cancelarButton.Clicked += (_, _) => modalOverlay.IsVisible = false;
            publicarButton.Clicked += async (_, _) =>
            {
                var titulo = tituloEntry.Text?.Trim();
                var conteudo = conteudoEditor.Text?.Trim();
                if (string.IsNullOrWhiteSpace(titulo) || string.IsNullOrWhiteSpace(conteudo))
                {
                    await DisplayAlert("Campos obrigatórios", "Informe o título e o conteúdo do aviso.", "OK");
                    return;
                }

                var escopo = string.IsNullOrWhiteSpace(escopoEntry.Text) ? "Geral" : escopoEntry.Text.Trim();
                AddAviso(titulo, $"{DateTime.Now:dd/MM/yyyy} • Autor: admin • Escopo: {escopo}", conteudo);
                tituloEntry.Text = string.Empty;
                conteudoEditor.Text = string.Empty;
                escopoEntry.Text = "Geral";
                modalOverlay.IsVisible = false;
            };

            // Monta a página
            Content = new Grid
            {
                Children =
                {
                    new ScrollView
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
                    },
                    modalOverlay
                }
            };
        }
    }
}
